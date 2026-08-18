import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Check, 
  Search, 
  FlaskConical, 
  Layers, 
  Tag, 
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { storage, STORAGE_KEYS } from '@/lib/storage';

export interface RateItem {
  id?: string;
  no?: string;
  code?: string;
  name: string;
  price: number;
  vial?: string;
  category?: string;
  department?: string;
  group?: string;
}

interface RateListExcelUploaderProps {
  onImportSuccess?: (importedItems: RateItem[]) => void;
  variant?: 'button' | 'card' | 'compact';
  buttonText?: string;
  className?: string;
}

export default function RateListExcelUploader({
  onImportSuccess,
  variant = 'button',
  buttonText = 'Upload Rate List (Excel)',
  className = ''
}: RateListExcelUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [parsedData, setParsedData] = useState<RateItem[]>([]);
  const [fileName, setFileName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [defaultCategory, setDefaultCategory] = useState<'Pathology' | 'Radiology'>('Pathology');
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to get color badge for vials
  const getVialBadgeColor = (vialStr: string = '') => {
    const v = vialStr.toLowerCase();
    if (v.includes('edta') || v.includes('lavender') || v.includes('purple')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (v.includes('sst') || v.includes('yellow') || v.includes('gel')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (v.includes('grey') || v.includes('gray') || v.includes('fluoride')) {
      return 'bg-slate-100 text-slate-800 border-slate-300';
    }
    if (v.includes('plain') || v.includes('red') || v.includes('clot')) {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    if (v.includes('blue') || v.includes('citrate')) {
      return 'bg-sky-100 text-sky-800 border-sky-200';
    }
    if (v.includes('green') || v.includes('heparin')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  };

  // Download standard sample Excel template
  const handleDownloadTemplate = () => {
    const sampleRows = [
      { "NO.": "1", "TEST": "Complete Blood Count (CBC)", "AMOUNT": 350, "VAIL": "EDTA (Lavender)" },
      { "NO.": "2", "TEST": "Liver Function Test (LFT)", "AMOUNT": 850, "VAIL": "SST Gel (Yellow)" },
      { "NO.": "3", "TEST": "Kidney Function Test (KFT)", "AMOUNT": 750, "VAIL": "SST Gel (Yellow)" },
      { "NO.": "4", "TEST": "Fasting Blood Sugar (FBS)", "AMOUNT": 120, "VAIL": "Sodium Fluoride (Grey)" },
      { "NO.": "5", "TEST": "Lipid Profile Master", "AMOUNT": 650, "VAIL": "Plain Clot (Red)" },
      { "NO.": "6", "TEST": "Thyroid Profile (T3, T4, TSH)", "AMOUNT": 600, "VAIL": "SST Gel (Yellow)" },
      { "NO.": "7", "TEST": "Serum Electrolytes (Na, K, Cl)", "AMOUNT": 450, "VAIL": "Plain Clot (Red)" },
      { "NO.": "8", "TEST": "Urine Routine & Microscopy", "AMOUNT": 150, "VAIL": "Sterile Container" },
      { "NO.": "9", "TEST": "HbA1c (Glycated Hemoglobin)", "AMOUNT": 500, "VAIL": "EDTA (Lavender)" },
      { "NO.": "10", "TEST": "Prothrombin Time (PT / INR)", "AMOUNT": 350, "VAIL": "Sodium Citrate (Blue)" }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    
    // Auto-width columns
    worksheet['!cols'] = [
      { wch: 8 },  // NO.
      { wch: 38 }, // TEST
      { wch: 12 }, // AMOUNT
      { wch: 25 }  // VAIL
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rate List");

    XLSX.writeFile(workbook, "Rate_List_Template_NO_TEST_AMOUNT_VAIL.xlsx");
    toast.success("Excel template (NO. TEST AMOUNT VAIL) downloaded successfully!");
  };

  // Parse uploaded file (.xlsx, .xls, .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const bstr = event.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert worksheet to raw json rows
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (!rawJson || rawJson.length === 0) {
          toast.error("The selected file appears to be empty.");
          setIsProcessing(false);
          return;
        }

        // Find header row (Search for NO / TEST / AMOUNT / VAIL / VIAL)
        let headerRowIndex = 0;
        let foundHeader = false;

        for (let i = 0; i < Math.min(rawJson.length, 10); i++) {
          const rowStr = rawJson[i].map((cell: any) => String(cell).toUpperCase()).join(' ');
          if (rowStr.includes('TEST') || rowStr.includes('AMOUNT') || rowStr.includes('VAIL') || rowStr.includes('VIAL') || rowStr.includes('PRICE') || rowStr.includes('RATE')) {
            headerRowIndex = i;
            foundHeader = true;
            break;
          }
        }

        const headers = rawJson[headerRowIndex].map((h: any) => String(h).trim().toUpperCase());

        // Column index mappers
        let noIdx = headers.findIndex((h: string) => h.includes('NO') || h.includes('S.NO') || h.includes('CODE') || h.includes('SR'));
        let testIdx = headers.findIndex((h: string) => h.includes('TEST') || h.includes('NAME') || h.includes('INVESTIGATION') || h.includes('SERVICE'));
        let amountIdx = headers.findIndex((h: string) => h.includes('AMOUNT') || h.includes('PRICE') || h.includes('RATE') || h.includes('COST') || h.includes('CHARGE'));
        let vialIdx = headers.findIndex((h: string) => h.includes('VAIL') || h.includes('VIAL') || h.includes('SAMPLE') || h.includes('CONTAINER') || h.includes('TUBE'));

        // Fallback positioning if headers are standard 0, 1, 2, 3
        if (testIdx === -1) testIdx = 1;
        if (amountIdx === -1) amountIdx = 2;
        if (vialIdx === -1) vialIdx = 3;
        if (noIdx === -1) noIdx = 0;

        const items: RateItem[] = [];

        for (let r = headerRowIndex + 1; r < rawJson.length; r++) {
          const row = rawJson[r];
          if (!row || row.length === 0) continue;

          const rawNo = row[noIdx] !== undefined ? String(row[noIdx]).trim() : '';
          const rawTest = row[testIdx] !== undefined ? String(row[testIdx]).trim() : '';
          const rawAmount = row[amountIdx] !== undefined ? String(row[amountIdx]).replace(/[^0-9.]/g, '') : '0';
          const rawVial = row[vialIdx] !== undefined ? String(row[vialIdx]).trim() : '';

          if (!rawTest && !rawAmount && !rawNo) continue; // Skip empty rows

          if (rawTest) {
            items.push({
              id: `test-xl-${Date.now()}-${r}`,
              no: rawNo || `${r}`,
              code: rawNo ? `TEST-${rawNo}` : `TEST-${r}`,
              name: rawTest,
              price: parseFloat(rawAmount) || 0,
              vial: rawVial || 'SST Serum',
              category: defaultCategory
            });
          }
        }

        if (items.length === 0) {
          toast.error("Could not find valid test rows in the uploaded sheet. Please check the column headers format: NO. | TEST | AMOUNT | VAIL");
          setIsProcessing(false);
          return;
        }

        setParsedData(items);
        setIsPreviewOpen(true);
        toast.success(`Successfully parsed ${items.length} test rates from Excel sheet!`);
      } catch (err: any) {
        console.error("Excel parse error:", err);
        toast.error("Failed to parse Excel file: " + (err.message || "Invalid file format"));
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsBinaryString(file);
  };

  // Perform Final Import to LocalStorage and Parent State
  const handleConfirmImport = () => {
    if (parsedData.length === 0) {
      toast.error("No test rate data to import.");
      return;
    }

    try {
      // 1. Update LAB_RATES in storage
      const existingLabRates = storage.get(STORAGE_KEYS.LAB_RATES, []);
      let newLabRates: any[] = [];

      const formattedNewRates = parsedData.map(item => ({
        id: item.id || `lt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: item.name,
        category: item.category || defaultCategory,
        price: item.price,
        vial: item.vial || 'SST Serum',
        code: item.no || item.code || ''
      }));

      if (importMode === 'replace') {
        newLabRates = formattedNewRates;
      } else {
        // Append / Merge: Avoid exact duplicate names if needed, or append
        const nameMap = new Set(existingLabRates.map((r: any) => r.name.toLowerCase()));
        const uniqueAppends = formattedNewRates.filter((r: any) => !nameMap.has(r.name.toLowerCase()));
        newLabRates = [...existingLabRates, ...uniqueAppends];
      }

      storage.set(STORAGE_KEYS.LAB_RATES, newLabRates);

      // 2. Also sync to LIS Investigations storage
      const existingLIS = storage.get('lis_investigations', []);
      let newLIS = [...existingLIS];

      parsedData.forEach((item, idx) => {
        const testCode = item.no ? `TEST-${item.no}` : `EXL-${idx + 100}`;
        const existingIdx = newLIS.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase());

        const lisItem = {
          code: testCode,
          name: item.name,
          shortName: item.name.substring(0, 8),
          department: defaultCategory,
          categoryId: 'CAT-GEN',
          subCategoryId: 'SUB-GEN',
          sampleType: item.vial || 'SST Serum',
          method: 'Automated Analyzer',
          machineName: 'General Analyzer',
          reportType: 'Quantitative' as const,
          tat: '4 Hours',
          normalRangeApplicable: true,
          criticalValueApplicable: true,
          nablCompliance: true,
          activeStatus: 'Active' as const,
          price: item.price
        };

        if (existingIdx >= 0) {
          newLIS[existingIdx] = { ...newLIS[existingIdx], price: item.price, sampleType: item.vial || newLIS[existingIdx].sampleType };
        } else {
          newLIS.push(lisItem);
        }
      });

      storage.set('lis_investigations', newLIS);

      toast.success(`Successfully imported ${parsedData.length} test rates into the system master!`);

      if (onImportSuccess) {
        onImportSuccess(newLabRates);
      }

      setIsPreviewOpen(false);
      setParsedData([]);
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Failed to save imported rate list: " + err.message);
    }
  };

  const filteredPreview = parsedData.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.vial && item.vial.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.no && item.no.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPriceSum = parsedData.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".xlsx, .xls, .csv" 
        className="hidden" 
      />

      {variant === 'card' ? (
        <div className="border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 p-4 rounded-2xl space-y-3 w-full shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Upload Rate List (Excel)</h4>
                <p className="text-[11px] text-slate-500">Format: <strong className="text-indigo-700">NO. | TEST | AMOUNT | VAIL</strong></p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadTemplate}
              className="text-xs h-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium"
            >
              <Download className="w-3.5 h-3.5 mr-1" /> Template
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isProcessing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 rounded-xl shadow-sm gap-1.5 flex-1"
            >
              <Upload className="w-4 h-4" />
              {isProcessing ? 'Reading Sheet...' : 'Select Excel File (.xlsx)'}
            </Button>
          </div>
        </div>
      ) : variant === 'compact' ? (
        <div className="flex items-center gap-1.5">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadTemplate}
            className="text-[11px] h-8 border-slate-200 text-slate-600 hover:text-indigo-600"
            title="Download NO. TEST AMOUNT VAIL template"
          >
            <Download className="w-3 h-3 mr-1 text-indigo-600" /> Excel Template
          </Button>
          <Button 
            size="sm" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isProcessing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] h-8 rounded-lg gap-1"
          >
            <Upload className="w-3 h-3" />
            {isProcessing ? 'Loading...' : 'Upload Excel'}
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownloadTemplate}
            className="text-xs h-9 border-slate-200 text-indigo-700 hover:bg-indigo-50 font-semibold rounded-xl gap-1"
          >
            <Download className="w-3.5 h-3.5" /> Sample Template
          </Button>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isProcessing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 rounded-xl shadow-sm gap-1.5"
          >
            <Upload className="w-4 h-4" />
            {isProcessing ? 'Processing Sheet...' : buttonText}
          </Button>
        </div>
      )}

      {/* Interactive Import Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] rounded-3xl p-6 flex flex-col">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    Review Excel Rate List
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      <Check className="w-3 h-3 mr-1" /> {parsedData.length} Tests Found
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Source File: <span className="font-semibold text-slate-700">{fileName}</span> • Mandatory Format Verified: <span className="font-semibold text-indigo-600">NO. | TEST | AMOUNT | VAIL</span>
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-xl">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Total Tests</p>
                <p className="text-base font-black text-slate-900">{parsedData.length} Items</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total List Value</p>
                <p className="text-base font-black text-slate-900">₹{totalPriceSum.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-purple-600 text-white rounded-xl">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Target Dept</p>
                <div className="flex gap-2 mt-0.5">
                  <button 
                    type="button"
                    onClick={() => setDefaultCategory('Pathology')} 
                    className={`text-xs px-2 py-0.5 rounded-md font-bold transition-all ${defaultCategory === 'Pathology' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 border'}`}
                  >
                    Pathology
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDefaultCategory('Radiology')} 
                    className={`text-xs px-2 py-0.5 rounded-md font-bold transition-all ${defaultCategory === 'Radiology' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 border'}`}
                  >
                    Radiology
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Import Settings Bar */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs mb-2">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="font-bold text-slate-700 shrink-0">Import Mode:</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input 
                    type="radio" 
                    name="importMode" 
                    value="append" 
                    checked={importMode === 'append'} 
                    onChange={() => setImportMode('append')}
                    className="accent-indigo-600 h-3.5 w-3.5"
                  />
                  <span className="font-medium text-slate-800">Append / Merge with existing rates</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input 
                    type="radio" 
                    name="importMode" 
                    value="replace" 
                    checked={importMode === 'replace'} 
                    onChange={() => setImportMode('replace')}
                    className="accent-rose-600 h-3.5 w-3.5"
                  />
                  <span className="font-medium text-rose-700">Replace entire rate list</span>
                </label>
              </div>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <Input 
                placeholder="Filter preview list..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Table Preview */}
          <ScrollArea className="flex-1 border border-slate-200 rounded-2xl overflow-hidden min-h-[260px] max-h-[360px]">
            <Table>
              <TableHeader className="bg-slate-100/80 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-16 font-bold text-slate-700 text-xs">NO.</TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs">TEST NAME</TableHead>
                  <TableHead className="w-28 font-bold text-slate-700 text-xs text-right">AMOUNT (₹)</TableHead>
                  <TableHead className="w-44 font-bold text-slate-700 text-xs">VAIL / SAMPLE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPreview.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-400 text-xs">
                      No matching records found in preview.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPreview.map((item, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-slate-500">
                        {item.no || idx + 1}
                      </TableCell>
                      <TableCell className="font-bold text-xs text-slate-800">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-right font-black text-xs text-emerald-700">
                        ₹{item.price.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 ${getVialBadgeColor(item.vial)}`}
                        >
                          {item.vial || 'SST Serum'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          <DialogFooter className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Will sync rates to LIMS Master, OPD Billing & Pathology Desk.</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsPreviewOpen(false)}
                className="text-xs h-9 rounded-xl border-slate-200"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmImport}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" /> Confirm & Import {parsedData.length} Rates
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
