import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  CreditCard, 
  Search, 
  Filter, 
  Printer, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Coins, 
  ArrowUpRight, 
  Receipt, 
  User, 
  Calendar, 
  FileText, 
  Sparkles, 
  QrCode, 
  Wallet, 
  ArrowDownCircle, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck,
  PackageCheck,
  Scissors,
  Stethoscope,
  Building,
  Bed,
  Microscope,
  Check,
  RefreshCw,
  Download,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { 
  getCentralCounterPayments, 
  saveCentralCounterPayment,
  saveAuditLog 
} from '@/services/supabaseService';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';

interface CentralizedPaymentCounterProps {
  bills: any[];
  patients: any[];
  users: any[];
  hospitalInfo: any;
  currentUser: any;
  onRefreshData: () => void | Promise<void>;
}

export function CentralizedPaymentCounter({
  bills,
  patients,
  users,
  hospitalInfo,
  currentUser,
  onRefreshData
}: CentralizedPaymentCounterProps) {
  // Mode tabs: 'settle-invoice' | 'advance-deposit' | 'counter-ledger'
  const [activeCounterTab, setActiveCounterTab] = useState<'settle-invoice' | 'advance-deposit' | 'counter-ledger'>('settle-invoice');

  // Counter Payment Records stored in storage
  const [counterPayments, setCounterPayments] = useState<any[]>(() => 
    storage.get(STORAGE_KEYS.CENTRAL_COUNTER_PAYMENTS, [])
  );

  // Sync counter payments from storage or Supabase
  const refreshCounterPayments = async () => {
    const list = await getCentralCounterPayments();
    setCounterPayments(list);
  };

  React.useEffect(() => {
    refreshCounterPayments();

    const handleDataSync = () => {
      refreshCounterPayments();
    };
    window.addEventListener('storage', handleDataSync);
    window.addEventListener('supabase-data-sync', handleDataSync);
    return () => {
      window.removeEventListener('storage', handleDataSync);
      window.removeEventListener('supabase-data-sync', handleDataSync);
    };
  }, []);

  // --- STATE FOR INVOICE SETTLEMENT ---
  const [selectedPatientId, setSelectedPatientId] = useState<string>('all');
  const [patientSearchTerm, setPatientSearchTerm] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  // Form fields for settlement
  const [settlementAmount, setSettlementAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<string>('Cash');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<string>('0');
  const [discountReason, setDiscountReason] = useState<string>('');
  const [payerName, setPayerName] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [transactionDateTime, setTransactionDateTime] = useState<string>(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE FOR ADVANCE DEPOSIT ---
  const [advPatientId, setAdvPatientId] = useState<string>('');
  const [advPatientSearchTerm, setAdvPatientSearchTerm] = useState<string>('');
  const [advActivityType, setAdvActivityType] = useState<string>('OT / Planned Surgery Deposit');
  const [advProcedureName, setAdvProcedureName] = useState<string>('');
  const [advAmount, setAdvAmount] = useState<string>('');
  const [advPaymentMode, setAdvPaymentMode] = useState<string>('Cash');
  const [advTransactionRef, setAdvTransactionRef] = useState<string>('');
  const [advBankName, setAdvBankName] = useState<string>('');
  const [advPayerName, setAdvPayerName] = useState<string>('');
  const [advExpectedDate, setAdvExpectedDate] = useState<string>('');
  const [advRemarks, setAdvRemarks] = useState<string>('');
  const [advTransactionDateTime, setAdvTransactionDateTime] = useState<string>(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  // --- STATE FOR LEDGER FILTERS ---
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState<string>('');
  const [ledgerDateFilter, setLedgerDateFilter] = useState<string>('today');
  const [ledgerModeFilter, setLedgerModeFilter] = useState<string>('all');
  const [ledgerDeptFilter, setLedgerDeptFilter] = useState<string>('all');

  // --- RECEIPT PRINT MODAL STATE ---
  const [previewReceipt, setPreviewReceipt] = useState<any | null>(null);

  // Filtered patients for auto-suggest
  const searchedPatients = useMemo(() => {
    if (!patientSearchTerm.trim()) return patients.slice(0, 8);
    const term = patientSearchTerm.toLowerCase();
    return patients.filter(p => 
      p.name?.toLowerCase().includes(term) ||
      p.mrn?.toLowerCase().includes(term) ||
      p.phone?.includes(term)
    ).slice(0, 10);
  }, [patients, patientSearchTerm]);

  const searchedAdvPatients = useMemo(() => {
    if (!advPatientSearchTerm.trim()) return patients.slice(0, 8);
    const term = advPatientSearchTerm.toLowerCase();
    return patients.filter(p => 
      p.name?.toLowerCase().includes(term) ||
      p.mrn?.toLowerCase().includes(term) ||
      p.phone?.includes(term)
    ).slice(0, 10);
  }, [patients, advPatientSearchTerm]);

  // Selected Patient object
  const selectedPatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  const selectedAdvPatient = useMemo(() => {
    return patients.find(p => p.id === advPatientId) || null;
  }, [patients, advPatientId]);

  // Unpaid or partially paid invoices across hospital or for selected patient
  const pendingInvoices = useMemo(() => {
    return bills.map(b => {
      const gross = Number(b.payable_amount ?? b.payableAmount ?? b.total_amount ?? b.totalAmount ?? 0);
      const disc = Number(b.discount_amount ?? b.discount ?? 0);
      const paid = Number(b.paid_amount ?? b.paidAmount ?? 0);
      const due = Math.max(0, gross - disc - paid);
      const pat = patients.find(p => p.id === (b.patient_id || b.patientId));
      
      const deptRaw = (b.department || b.category || b.service_type || b.serviceType || 'General').toUpperCase();
      let department = 'General';
      if (deptRaw.includes('IPD') || deptRaw.includes('WARD') || deptRaw.includes('BED')) department = 'IPD / Ward';
      else if (deptRaw.includes('OPD') || deptRaw.includes('CONSULT')) department = 'OPD Services';
      else if (deptRaw.includes('PHARM') || deptRaw.includes('MEDICINE')) department = 'Pharmacy POS';
      else if (deptRaw.includes('LAB') || deptRaw.includes('PATH') || deptRaw.includes('RADIO')) department = 'Laboratory / Radiology';
      else if (deptRaw.includes('OT') || deptRaw.includes('SURGERY')) department = 'OT & Surgical';
      else if (deptRaw.includes('EMERGENCY') || deptRaw.includes('CASUALTY')) department = 'Emergency Triage';
      else if (deptRaw.includes('SUPPLY') || deptRaw.includes('MATERIAL')) department = 'Materials & Supplies';

      return {
        ...b,
        patientName: pat?.name || b.patient_name || b.patientName || 'Walk-in / Direct Client',
        patientMrn: pat?.mrn || b.patient_mrn || b.patientMrn || 'N/A',
        patientPhone: pat?.phone || b.patient_phone || b.patientPhone || 'N/A',
        gross,
        disc,
        paid,
        due,
        computedDepartment: department
      };
    }).filter(b => {
      if (b.due <= 0.01) return false; // ignore fully paid
      if (selectedPatientId !== 'all' && (b.patient_id !== selectedPatientId && b.patientId !== selectedPatientId)) {
        return false;
      }
      if (departmentFilter !== 'all' && b.computedDepartment !== departmentFilter) {
        return false;
      }
      return true;
    });
  }, [bills, patients, selectedPatientId, departmentFilter]);

  // Handle invoice selection toggle
  const toggleSelectInvoice = (invId: string) => {
    setSelectedInvoiceIds(prev => {
      const exists = prev.includes(invId);
      const updated = exists ? prev.filter(id => id !== invId) : [...prev, invId];
      
      // Auto compute total due for selected
      const selectedInvs = pendingInvoices.filter(i => updated.includes(i.id));
      const totalDueSelected = selectedInvs.reduce((sum, i) => sum + i.due, 0);
      setSettlementAmount(totalDueSelected > 0 ? totalDueSelected.toFixed(2) : '');
      
      return updated;
    });
  };

  const selectAllInvoicesForPatient = () => {
    const allIds = pendingInvoices.map(i => i.id);
    setSelectedInvoiceIds(allIds);
    const total = pendingInvoices.reduce((sum, i) => sum + i.due, 0);
    setSettlementAmount(total > 0 ? total.toFixed(2) : '');
  };

  const clearSelectedInvoices = () => {
    setSelectedInvoiceIds([]);
    setSettlementAmount('');
  };

  // --- PROCESS INVOICE SETTLEMENT AT CENTRAL COUNTER ---
  const handleProcessSettlement = async () => {
    if (selectedInvoiceIds.length === 0) {
      toast.error('Please select at least one invoice to settle payment against.');
      return;
    }

    const payAmt = parseFloat(settlementAmount);
    if (isNaN(payAmt) || payAmt <= 0) {
      toast.error('Please enter a valid payment collection amount.');
      return;
    }

    if (paymentMode !== 'Cash' && !transactionRef.trim()) {
      toast.error(`Please enter Transaction Ref / UTR / Cheque Number for ${paymentMode} payment.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedInvoices = pendingInvoices.filter(i => selectedInvoiceIds.includes(i.id));
      const totalOutstanding = selectedInvoices.reduce((sum, i) => sum + i.due, 0);

      if (payAmt > totalOutstanding + 0.05) {
        toast.error(`Collection amount ₹${payAmt.toFixed(2)} exceeds total outstanding dues ₹${totalOutstanding.toFixed(2)} for selected invoices.`);
        setIsSubmitting(false);
        return;
      }

      let remainingPayment = payAmt;
      let successCount = 0;
      const receiptNo = `CC-RCP-${Date.now().toString().slice(-6)}`;
      const cashierName = currentUser?.name || 'Central Cashier';

      const settledItemsLog: any[] = [];

      for (const inv of selectedInvoices) {
        if (remainingPayment <= 0) break;
        const amtForThisInv = Math.min(inv.due, remainingPayment);

        const updated = await supabaseService.receivePayment(
          inv.id,
          amtForThisInv,
          paymentMode,
          transactionRef,
          `Central Counter [Receipt: ${receiptNo}] ${remarks ? `| ${remarks}` : ''}`,
          transactionDateTime
        );

        if (updated) {
          successCount++;
          settledItemsLog.push({
            invoiceId: inv.id,
            department: inv.computedDepartment,
            description: inv.description || inv.items?.[0]?.name || 'Medical Services / Supply',
            amountPaid: amtForThisInv,
            previousPaid: inv.paid,
            totalGross: inv.gross,
            remainingDue: Math.max(0, inv.due - amtForThisInv)
          });
        }
        remainingPayment -= amtForThisInv;
      }

      if (successCount > 0) {
        // Record Central Counter Payment entry in STORAGE_KEYS.CENTRAL_COUNTER_PAYMENTS
        const primaryPatient = selectedPatient || {
          name: selectedInvoices[0]?.patientName || 'Walk-in Client',
          mrn: selectedInvoices[0]?.patientMrn || 'N/A',
          phone: selectedInvoices[0]?.patientPhone || 'N/A'
        };

        const counterRecord = {
          id: `ccp_${Date.now()}`,
          receiptNo,
          date: transactionDateTime,
          patientId: primaryPatient.id || 'walk-in',
          patientName: primaryPatient.name,
          patientMrn: primaryPatient.mrn,
          patientPhone: primaryPatient.phone,
          transactionType: 'Invoice Settlement',
          department: selectedInvoices[0]?.computedDepartment || 'Central Counter',
          amountPaid: payAmt,
          discountAmount: parseFloat(discountAmount) || 0,
          discountReason: discountReason || '',
          paymentMode,
          transactionRef,
          bankName,
          payerName: payerName || primaryPatient.name,
          remarks,
          cashierName,
          settledItems: settledItemsLog
        };

        const savedCounter = await saveCentralCounterPayment(counterRecord);
        const existingLogs = storage.get(STORAGE_KEYS.CENTRAL_COUNTER_PAYMENTS, []);
        const updatedLogs = [savedCounter, ...existingLogs.filter((item: any) => item.id !== savedCounter.id)];
        storage.set(STORAGE_KEYS.CENTRAL_COUNTER_PAYMENTS, updatedLogs);
        refreshCounterPayments();

        // Audit log
        const auditRecord = {
          id: `audit_${Date.now()}`,
          timestamp: new Date().toISOString(),
          userName: cashierName,
          userRole: currentUser?.role || 'CASHIER',
          action: 'CENTRAL_COUNTER_SETTLEMENT',
          details: `Collected ₹${payAmt.toFixed(2)} via ${paymentMode} (Receipt: ${receiptNo}) for ${primaryPatient.name}`,
        };
        saveAuditLog(auditRecord);
        const logs = storage.get(STORAGE_KEYS.AUDIT_LOGS, []);
        storage.set(STORAGE_KEYS.AUDIT_LOGS, [auditRecord, ...logs]);

        toast.success(`Payment of ₹${payAmt.toFixed(2)} recorded successfully! Receipt #${receiptNo} generated.`);
        
        // Refresh parent data
        await onRefreshData();

        // Reset form
        setSelectedInvoiceIds([]);
        setSettlementAmount('');
        setTransactionRef('');
        setBankName('');
        setDiscountAmount('0');
        setDiscountReason('');
        setPayerName('');
        setRemarks('');

        // Open Receipt Modal
        setPreviewReceipt(counterRecord);
      } else {
        toast.error('Failed to process payment settlement.');
      }
    } catch (err: any) {
      toast.error('Error settling payment: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- PROCESS ADVANCE DEPOSIT AT CENTRAL COUNTER ---
  const handleProcessAdvanceDeposit = async () => {
    if (!selectedAdvPatient) {
      toast.error('Please search and select a patient to record advance payment for.');
      return;
    }

    const amt = parseFloat(advAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid advance deposit amount.');
      return;
    }

    if (advPaymentMode !== 'Cash' && !advTransactionRef.trim()) {
      toast.error(`Please enter Transaction Ref / UTR / Cheque Number for ${advPaymentMode} advance deposit.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const receiptNo = `CC-ADV-${Date.now().toString().slice(-6)}`;
      const cashierName = currentUser?.name || 'Central Cashier';

      // Create an Advance Invoice Record in STORAGE_KEYS.BILLING so it merges with Ledger & Accounts
      const advanceInvoice = {
        id: `adv_inv_${Date.now()}`,
        patient_id: selectedAdvPatient.id,
        patientId: selectedAdvPatient.id,
        patient_name: selectedAdvPatient.name,
        patientName: selectedAdvPatient.name,
        patient_mrn: selectedAdvPatient.mrn,
        patientMrn: selectedAdvPatient.mrn,
        total_amount: amt,
        totalAmount: amt,
        payable_amount: amt,
        payableAmount: amt,
        paid_amount: amt,
        paidAmount: amt,
        discount_amount: 0,
        payment_status: 'Advance Paid',
        paymentStatus: 'Advance Paid',
        status: 'Advance Paid',
        payment_method: advPaymentMode,
        paymentMethod: advPaymentMode,
        payment_reference: advTransactionRef,
        department: advActivityType,
        category: advActivityType,
        description: `ADVANCE DEPOSIT: ${advActivityType} ${advProcedureName ? `(${advProcedureName})` : ''} - Target Date: ${advExpectedDate || 'N/A'}`,
        created_at: advTransactionDateTime,
        is_advance: true,
        items: [
          {
            name: `Advance Deposit (${advActivityType})`,
            quantity: 1,
            unit_price: amt,
            total: amt
          }
        ]
      };

      const existingBills = storage.get(STORAGE_KEYS.BILLING, []);
      storage.set(STORAGE_KEYS.BILLING, [advanceInvoice, ...existingBills]);

      // Record in Central Counter Payments
      const counterRecord = {
        id: `ccp_${Date.now()}`,
        receiptNo,
        date: advTransactionDateTime,
        patientId: selectedAdvPatient.id,
        patientName: selectedAdvPatient.name,
        patientMrn: selectedAdvPatient.mrn,
        patientPhone: selectedAdvPatient.phone,
        transactionType: 'Advance Deposit',
        department: advActivityType,
        procedureName: advProcedureName,
        expectedDate: advExpectedDate,
        amountPaid: amt,
        discountAmount: 0,
        paymentMode: advPaymentMode,
        transactionRef: advTransactionRef,
        bankName: advBankName,
        payerName: advPayerName || selectedAdvPatient.name,
        remarks: advRemarks,
        cashierName,
        settledItems: [
          {
            invoiceId: advanceInvoice.id,
            department: advActivityType,
            description: `Advance Deposit for ${advActivityType} ${advProcedureName ? `- ${advProcedureName}` : ''}`,
            amountPaid: amt,
            remainingDue: 0
          }
        ]
      };

      const savedCounter = await saveCentralCounterPayment(counterRecord);
      const existingLogs = storage.get(STORAGE_KEYS.CENTRAL_COUNTER_PAYMENTS, []);
      const updatedLogs = [savedCounter, ...existingLogs.filter((item: any) => item.id !== savedCounter.id)];
      storage.set(STORAGE_KEYS.CENTRAL_COUNTER_PAYMENTS, updatedLogs);
      refreshCounterPayments();

      // Dispatch events for live sync
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('supabase-data-sync', { 
        detail: { table: 'invoices', action: 'create' } 
      }));

      // Audit log
      const advAuditRecord = {
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userName: cashierName,
        userRole: currentUser?.role || 'CASHIER',
        action: 'CENTRAL_COUNTER_ADVANCE_DEPOSIT',
        details: `Collected Advance Deposit ₹${amt.toFixed(2)} via ${advPaymentMode} for ${selectedAdvPatient.name} (${advActivityType})`,
      };
      saveAuditLog(advAuditRecord);
      const logs = storage.get(STORAGE_KEYS.AUDIT_LOGS, []);
      storage.set(STORAGE_KEYS.AUDIT_LOGS, [advAuditRecord, ...logs]);

      toast.success(`Advance Deposit of ₹${amt.toFixed(2)} recorded successfully! Receipt #${receiptNo} issued.`);

      // Refresh parent data
      await onRefreshData();

      // Reset form
      setAdvAmount('');
      setAdvTransactionRef('');
      setAdvBankName('');
      setAdvProcedureName('');
      setAdvPayerName('');
      setAdvRemarks('');

      // Open Receipt Modal
      setPreviewReceipt(counterRecord);
    } catch (err: any) {
      toast.error('Error recording advance deposit: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- KPI CALCULATIONS FOR COUNTER ---
  const todayStr = new Date().toISOString().split('T')[0];

  const todayCounterPayments = useMemo(() => {
    return counterPayments.filter(p => {
      const d = p.date ? p.date.split('T')[0] : '';
      return d === todayStr;
    });
  }, [counterPayments, todayStr]);

  const kpiStats = useMemo(() => {
    let todayTotal = 0;
    let todayCash = 0;
    let todayUpi = 0;
    let todayCardBank = 0;
    let todayAdvances = 0;

    todayCounterPayments.forEach(p => {
      const amt = Number(p.amountPaid || 0);
      todayTotal += amt;
      const mode = (p.paymentMode || '').toLowerCase();
      if (mode.includes('cash')) todayCash += amt;
      else if (mode.includes('upi') || mode.includes('qr')) todayUpi += amt;
      else todayCardBank += amt;

      if (p.transactionType === 'Advance Deposit') {
        todayAdvances += amt;
      }
    });

    const totalHospitalOutstanding = pendingInvoices.reduce((sum, i) => sum + i.due, 0);

    return {
      todayTotal,
      todayCash,
      todayUpi,
      todayCardBank,
      todayAdvances,
      totalHospitalOutstanding
    };
  }, [todayCounterPayments, pendingInvoices]);

  // --- FILTERED CENTRAL COUNTER LEDGER ---
  const filteredLedgerPayments = useMemo(() => {
    return counterPayments.filter(p => {
      // Date filter
      if (ledgerDateFilter === 'today') {
        if (p.date?.split('T')[0] !== todayStr) return false;
      } else if (ledgerDateFilter === 'yesterday') {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        const yStr = y.toISOString().split('T')[0];
        if (p.date?.split('T')[0] !== yStr) return false;
      }

      // Mode filter
      if (ledgerModeFilter !== 'all') {
        if (!p.paymentMode?.toLowerCase().includes(ledgerModeFilter.toLowerCase())) return false;
      }

      // Dept filter
      if (ledgerDeptFilter !== 'all') {
        if (p.department !== ledgerDeptFilter) return false;
      }

      // Search term
      if (ledgerSearchTerm.trim()) {
        const term = ledgerSearchTerm.toLowerCase();
        const matchName = p.patientName?.toLowerCase().includes(term);
        const matchMrn = p.patientMrn?.toLowerCase().includes(term);
        const matchRcp = p.receiptNo?.toLowerCase().includes(term);
        const matchRef = p.transactionRef?.toLowerCase().includes(term);
        if (!matchName && !matchMrn && !matchRcp && !matchRef) return false;
      }

      return true;
    });
  }, [counterPayments, ledgerDateFilter, ledgerModeFilter, ledgerDeptFilter, ledgerSearchTerm, todayStr]);

  // --- GENERATE PRINTABLE RECEIPT HTML ---
  const handlePrintReceipt = (record: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print the payment receipt.');
      return;
    }

    const hLogo = hospitalInfo.logo ? `<img src="${hospitalInfo.logo}" style="height: 55px; margin-bottom: 8px;" />` : '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Central Counter Payment Receipt - ${record.receiptNo}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; color: #0f172a; background: #ffffff; }
            .receipt-container { border: 2px solid #0284c7; border-radius: 12px; padding: 24px; max-width: 800px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
            .hospital-name { font-size: 24px; font-weight: 800; color: #0284c7; letter-spacing: -0.02em; margin: 4px 0; }
            .hospital-address { font-size: 11px; color: #64748b; font-weight: 500; }
            .receipt-title-badge { display: inline-block; background: #0284c7; color: white; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 10px; }
            
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px; font-size: 13px; }
            .meta-item { display: flex; flex-direction: column; }
            .meta-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; }
            .meta-val { font-weight: 700; color: #0f172a; margin-top: 2px; }

            .table-styled { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
            .table-styled th { background: #f1f5f9; color: #334155; text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
            .table-styled td { padding: 12px; border-bottom: 1px solid #e2e8f0; }

            .summary-box { background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .amount-big { font-size: 22px; font-weight: 900; color: #0369a1; }

            .footer-sig { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; pt-20px; border-top: 1px dashed #cbd5e1; font-size: 12px; }
            .sig-line { width: 180px; border-top: 1px solid #0f172a; text-align: center; padding-top: 6px; font-weight: 700; color: #475569; }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              ${hLogo}
              <div class="hospital-name">${hospitalInfo.name}</div>
              <div class="hospital-address">${hospitalInfo.address} | Tel: ${hospitalInfo.phone}</div>
              <div class="receipt-title-badge">Centralised Payment Counter Receipt</div>
            </div>

            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label">Receipt Number</span>
                <span class="meta-val" style="color: #0284c7;">${record.receiptNo}</span>
              </div>
              <div class="meta-item" style="text-align: right;">
                <span class="meta-label">Date & Time</span>
                <span class="meta-val">${formatDate(record.date)}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Patient Name & UHID</span>
                <span class="meta-val">${record.patientName} (${record.patientMrn || 'N/A'})</span>
              </div>
              <div class="meta-item" style="text-align: right;">
                <span class="meta-label">Contact Phone</span>
                <span class="meta-val">${record.patientPhone || 'N/A'}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Transaction Type</span>
                <span class="meta-val" style="color: #0d9488;">${record.transactionType}</span>
              </div>
              <div class="meta-item" style="text-align: right;">
                <span class="meta-label">Department / Activity</span>
                <span class="meta-val">${record.department}</span>
              </div>
            </div>

            <table class="table-styled">
              <thead>
                <tr>
                  <th>Particulars / Department Activity</th>
                  <th style="text-align: right;">Mode & UTR / Ref</th>
                  <th style="text-align: right;">Amount Collected (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${record.settledItems?.map((it: any) => `
                  <tr>
                    <td>
                      <div style="font-weight: 700; color: #0f172a;">${it.description || 'Invoice Settlement'}</div>
                      <div style="font-size: 11px; color: #64748b;">Dept: ${it.department}</div>
                    </td>
                    <td style="text-align: right; font-weight: 600;">
                      <div>${record.paymentMode}</div>
                      ${record.transactionRef ? `<div style="font-size: 11px; color: #0284c7;">Ref: ${record.transactionRef}</div>` : ''}
                    </td>
                    <td style="text-align: right; font-weight: 800; font-size: 14px; color: #0f172a;">
                      ₹${Number(it.amountPaid || record.amountPaid).toFixed(2)}
                    </td>
                  </tr>
                `).join('') || `
                  <tr>
                    <td>
                      <div style="font-weight: 700; color: #0f172a;">${record.transactionType} - ${record.department}</div>
                      ${record.procedureName ? `<div style="font-size: 11px; color: #64748b;">Procedure: ${record.procedureName}</div>` : ''}
                    </td>
                    <td style="text-align: right; font-weight: 600;">
                      <div>${record.paymentMode}</div>
                      ${record.transactionRef ? `<div style="font-size: 11px; color: #0284c7;">Ref: ${record.transactionRef}</div>` : ''}
                    </td>
                    <td style="text-align: right; font-weight: 800; font-size: 14px; color: #0f172a;">
                      ₹${Number(record.amountPaid).toFixed(2)}
                    </td>
                  </tr>
                `}
              </tbody>
            </table>

            <div class="summary-box">
              <div>
                <div style="font-size: 11px; font-weight: 800; uppercase; color: #0369a1;">Net Amount Received at Counter</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                  Payer: ${record.payerName || record.patientName} | Mode: <strong>${record.paymentMode}</strong>
                </div>
              </div>
              <div class="amount-big">₹${Number(record.amountPaid).toFixed(2)}</div>
            </div>

            ${record.remarks ? `
              <div style="background: #f8fafc; border-left: 3px solid #0284c7; padding: 10px; font-size: 12px; margin-bottom: 20px;">
                <strong>Notes / Remarks:</strong> ${record.remarks}
              </div>
            ` : ''}

            <div class="footer-sig">
              <div>
                <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">System Stamp & Verification</div>
                <div style="font-size: 11px; font-weight: 700; color: #0284c7; margin-top: 4px;">Synced with Accounts Ledger & Books</div>
              </div>
              <div class="sig-line">
                <div>${record.cashierName || 'Authorised Cashier'}</div>
                <div style="font-size: 10px; color: #64748b; font-weight: 400; margin-top: 2px;">Central Counter Signature</div>
              </div>
            </div>
          </div>

          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 800);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR & COUNTER DASHBOARD */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Building2 className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Centralised Payment Counter Active
              </span>
              <span className="inline-flex items-center gap-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                Ledger & Book Synced
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Building2 className="w-7 h-7 text-sky-400" />
              Centralised Payment Collection Counter
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-1">
              Single-window payment counter to collect dues against generated invoices or advance deposits across all hospital departments (IPD, OPD, OT, Pharmacy, Lab, Radiology, Materials). All transactions automatically update the patient consolidated ledger and accounts cashbook.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setActiveCounterTab('settle-invoice')}
              className={`rounded-xl font-bold text-xs gap-2 ${
                activeCounterTab === 'settle-invoice' 
                  ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/30' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Settle Invoices
            </Button>
            <Button
              onClick={() => setActiveCounterTab('advance-deposit')}
              className={`rounded-xl font-bold text-xs gap-2 ${
                activeCounterTab === 'advance-deposit' 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              Collect Advance
            </Button>
            <Button
              onClick={() => setActiveCounterTab('counter-ledger')}
              className={`rounded-xl font-bold text-xs gap-2 ${
                activeCounterTab === 'counter-ledger' 
                  ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Receipt className="w-4 h-4" />
              Counter Ledger ({counterPayments.length})
            </Button>
          </div>
        </div>

        {/* COUNTER KPI METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between text-slate-300 text-[10px] font-bold uppercase tracking-wider">
              <span>Today's Total</span>
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-black text-white mt-1">{formatCurrency(kpiStats.todayTotal)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{todayCounterPayments.length} counter transactions</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between text-slate-300 text-[10px] font-bold uppercase tracking-wider">
              <span>Cash in Hand</span>
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-black text-amber-300 mt-1">{formatCurrency(kpiStats.todayCash)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Physical cash drawer</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between text-slate-300 text-[10px] font-bold uppercase tracking-wider">
              <span>UPI / Digital</span>
              <QrCode className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-lg font-black text-sky-300 mt-1">{formatCurrency(kpiStats.todayUpi)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">GPay / PhonePe / QR</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between text-slate-300 text-[10px] font-bold uppercase tracking-wider">
              <span>Card / Bank</span>
              <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-lg font-black text-indigo-300 mt-1">{formatCurrency(kpiStats.todayCardBank)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">POS / NEFT / Cheque</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between text-slate-300 text-[10px] font-bold uppercase tracking-wider">
              <span>Advances Today</span>
              <ArrowDownCircle className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="text-lg font-black text-teal-300 mt-1">{formatCurrency(kpiStats.todayAdvances)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">OT / IPD / Supply pre-pays</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between text-slate-300 text-[10px] font-bold uppercase tracking-wider">
              <span>Hospital Dues</span>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-lg font-black text-rose-300 mt-1">{formatCurrency(kpiStats.totalHospitalOutstanding)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{pendingInvoices.length} open invoices</div>
          </div>
        </div>
      </div>

      {/* COUNTER MAIN TABS CONTENT */}
      {activeCounterTab === 'settle-invoice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: INVOICE SEARCH & SELECTION (8 COLS) */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Search className="w-4 h-4 text-sky-600" />
                      1. Select Patient & Filter Pending Invoices
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Search patient by MRN/UHID or name to locate pending bills across departments.
                    </CardDescription>
                  </div>
                  {selectedInvoiceIds.length > 0 && (
                    <Badge variant="secondary" className="bg-sky-100 text-sky-800 font-bold px-3 py-1 text-xs self-start sm:self-auto">
                      {selectedInvoiceIds.length} Invoice(s) Selected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* PATIENT SEARCH & DEPT FILTER */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-bold text-slate-700">Patient Search / Auto-suggest</Label>
                    <div className="relative mt-1">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <Input
                        placeholder="Search Name, MRN or Phone..."
                        value={patientSearchTerm}
                        onChange={(e) => setPatientSearchTerm(e.target.value)}
                        className="pl-9 h-9 text-xs"
                      />
                    </div>

                    {/* Patient Quick Chips */}
                    <div className="flex flex-wrap gap-1 mt-2 max-h-24 overflow-y-auto pr-1">
                      <button
                        type="button"
                        onClick={() => { setSelectedPatientId('all'); setPatientSearchTerm(''); }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-all ${
                          selectedPatientId === 'all'
                            ? 'bg-sky-600 text-white border-sky-700'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        All Patients ({pendingInvoices.length})
                      </button>
                      {searchedPatients.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPatientId(p.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-all flex items-center gap-1 ${
                            selectedPatientId === p.id
                              ? 'bg-sky-600 text-white border-sky-700 shadow-2xs'
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-sky-50'
                          }`}
                        >
                          <User className="w-2.5 h-2.5" />
                          <span>{p.name}</span>
                          <span className="opacity-75">({p.mrn || 'MRN'})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-slate-700">Department / Supply Filter</Label>
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="w-full text-xs h-9 rounded-md border border-slate-200 bg-white px-3 mt-1 font-semibold text-slate-800 focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="all">All Departments / Supply Services</option>
                      <option value="IPD / Ward">IPD / Ward & Bed Charges</option>
                      <option value="OPD Services">OPD Consultation & Procedures</option>
                      <option value="Pharmacy POS">Pharmacy POS & Medicines</option>
                      <option value="Laboratory / Radiology">Laboratory & Radiology Diagnostics</option>
                      <option value="OT & Surgical">OT & Surgical Services</option>
                      <option value="Emergency Triage">Emergency / Triage</option>
                      <option value="Materials & Supplies">Materials & Consumables Supply</option>
                    </select>

                    {selectedPatient && (
                      <div className="mt-2 p-2 bg-sky-50/80 border border-sky-200 rounded-lg text-xs">
                        <div className="font-bold text-sky-900 flex items-center justify-between">
                          <span>{selectedPatient.name}</span>
                          <Badge className="bg-sky-200 text-sky-900 text-[10px] font-extrabold">{selectedPatient.mrn}</Badge>
                        </div>
                        <div className="text-[11px] text-sky-700 mt-0.5 flex gap-3">
                          <span>Phone: {selectedPatient.phone || 'N/A'}</span>
                          <span>Age/Gender: {selectedPatient.age || 'N/A'}Y / {selectedPatient.gender || 'N/A'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* PENDING INVOICES TABLE */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                      Pending Invoices ({pendingInvoices.length})
                    </span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={selectAllInvoicesForPatient}
                        disabled={pendingInvoices.length === 0}
                        className="text-[11px] h-7 font-bold text-sky-700 border-sky-200 hover:bg-sky-50"
                      >
                        Select All Pending
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearSelectedInvoices}
                        disabled={selectedInvoiceIds.length === 0}
                        className="text-[11px] h-7 font-bold text-slate-500"
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                          <TableHead className="w-10 text-center">Select</TableHead>
                          <TableHead>Invoice ID / Date</TableHead>
                          <TableHead>Patient & Dept</TableHead>
                          <TableHead className="text-right">Billed (₹)</TableHead>
                          <TableHead className="text-right">Paid (₹)</TableHead>
                          <TableHead className="text-right font-black text-rose-600">Due (₹)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingInvoices.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-10 text-xs text-slate-500">
                              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                              <div className="font-bold text-slate-700">No Pending Dues Found</div>
                              <p className="text-[11px] text-slate-400 mt-0.5">All invoices for selected filters are fully settled!</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          pendingInvoices.map((inv) => {
                            const isSelected = selectedInvoiceIds.includes(inv.id);
                            return (
                              <TableRow
                                key={inv.id}
                                onClick={() => toggleSelectInvoice(inv.id)}
                                className={`cursor-pointer transition-colors ${
                                  isSelected ? 'bg-sky-50/90 font-medium' : 'hover:bg-slate-50/60'
                                }`}
                              >
                                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelectInvoice(inv.id)}
                                    className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                                  />
                                </TableCell>
                                <TableCell className="py-2.5">
                                  <div className="font-bold text-sky-900 text-xs">#{inv.id.split('-').pop()?.toUpperCase()}</div>
                                  <div className="text-[10px] text-slate-500">{formatDate(inv.created_at || inv.date)}</div>
                                </TableCell>
                                <TableCell className="py-2.5">
                                  <div className="font-bold text-slate-800 text-xs">{inv.patientName}</div>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-bold bg-white text-slate-600">
                                      {inv.computedDepartment}
                                    </Badge>
                                    {inv.patientMrn && <span className="text-[10px] text-slate-400">({inv.patientMrn})</span>}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right py-2.5 font-semibold text-slate-700 text-xs">
                                  ₹{inv.gross.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right py-2.5 font-semibold text-emerald-600 text-xs">
                                  ₹{inv.paid.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right py-2.5 font-black text-rose-600 text-xs">
                                  ₹{inv.due.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: PAYMENT COLLECTION FORM (4 COLS) */}
          <div className="lg:col-span-4">
            <Card className="border-sky-200 shadow-md bg-gradient-to-b from-sky-50/40 via-white to-white sticky top-4">
              <CardHeader className="pb-3 border-b border-sky-100">
                <CardTitle className="text-base font-bold text-sky-950 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sky-600" />
                  2. Central Counter Collection Form
                </CardTitle>
                <CardDescription className="text-xs">
                  Record payment, select mode & sync with accounts ledger.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* PAYMENT AMOUNT FIELD */}
                <div>
                  <Label className="text-xs font-bold text-slate-800">Amount Being Collected (₹)</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2 text-sm font-extrabold text-sky-700">₹</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={settlementAmount}
                      onChange={(e) => setSettlementAmount(e.target.value)}
                      className="pl-7 h-10 font-black text-base text-sky-900 border-sky-300 focus:border-sky-500 bg-white"
                    />
                  </div>
                  {selectedInvoiceIds.length > 0 && (
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">
                      Auto-filled from {selectedInvoiceIds.length} selected invoice(s).
                    </p>
                  )}
                </div>

                {/* PAYMENT MODE & REFERENCE */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-bold text-slate-800">Payment Mode</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-1">
                      {[
                        { mode: 'Cash', icon: Wallet },
                        { mode: 'UPI / QR', icon: QrCode },
                        { mode: 'Credit Card', icon: CreditCard },
                        { mode: 'Debit Card', icon: CreditCard },
                        { mode: 'Net Banking', icon: Building },
                        { mode: 'Cheque / DD', icon: FileText }
                      ].map((item) => {
                        const IconComp = item.icon;
                        const active = paymentMode === item.mode;
                        return (
                          <button
                            key={item.mode}
                            type="button"
                            onClick={() => setPaymentMode(item.mode)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[11px] font-bold transition-all gap-1 ${
                              active 
                                ? 'bg-sky-600 text-white border-sky-700 shadow-sm ring-1 ring-sky-400' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50'
                            }`}
                          >
                            <IconComp className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-500'}`} />
                            <span>{item.mode}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {paymentMode !== 'Cash' && (
                    <div>
                      <Label className="text-xs font-bold text-slate-800">
                        {paymentMode.includes('UPI') ? 'UPI Transaction / UTR No' : paymentMode.includes('Cheque') ? 'Cheque / DD Number' : 'Transaction Ref / Card Approval Code'}
                      </Label>
                      <Input
                        placeholder="e.g. UTR / Ref / Approval No..."
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="h-8 text-xs mt-1 bg-white border-sky-200"
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Bank Name / Card Issuer (Optional)</Label>
                    <Input
                      placeholder="e.g. HDFC Bank, SBI..."
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="h-8 text-xs mt-1 bg-white border-slate-200"
                    />
                  </div>
                </div>

                {/* PAYER & REMARKS */}
                <div className="grid grid-cols-1 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Payer Name (if relative / attendant)</Label>
                    <Input
                      placeholder="Name of person making payment..."
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      className="h-8 text-xs mt-1 bg-white border-slate-200"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Counter Remarks / Notes</Label>
                    <Input
                      placeholder="e.g. Counter payment settled by attendant..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="h-8 text-xs mt-1 bg-white border-slate-200"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] font-semibold text-slate-600">Transaction Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={transactionDateTime}
                      onChange={(e) => setTransactionDateTime(e.target.value)}
                      className="h-8 text-xs mt-1 bg-white border-slate-200"
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <Button
                  onClick={handleProcessSettlement}
                  disabled={isSubmitting || selectedInvoiceIds.length === 0}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold py-5 gap-2 shadow-md shadow-sky-200 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing Counter Receipt...
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4" />
                      Collect Payment & Issue Counter Receipt
                    </>
                  )}
                </Button>

                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] text-emerald-800 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Automatically updates Patient Consolidated Ledger & Hospital Accounts Ledger.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ADVANCE PAYMENT TAB */}
      {activeCounterTab === 'advance-deposit' && (
        <div className="max-w-4xl mx-auto">
          <Card className="border-emerald-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-t-xl pb-4">
              <div className="flex items-center gap-2">
                <ArrowDownCircle className="w-6 h-6 text-emerald-300" />
                <div>
                  <CardTitle className="text-lg font-black text-white">Central Counter Advance Payment Deposit</CardTitle>
                  <CardDescription className="text-emerald-100 text-xs">
                    Issue official advance payment receipts for OT Surgeries, IPD Bed Admissions, Pharmacy pre-pay, or Material Supply.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* STEP 1: PATIENT SEARCH */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" />
                  1. Search & Select Patient / Client
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Input
                      placeholder="Type Patient Name, MRN, UHID or Phone..."
                      value={advPatientSearchTerm}
                      onChange={(e) => setAdvPatientSearchTerm(e.target.value)}
                      className="h-9 text-xs border-emerald-200 focus:border-emerald-500"
                    />
                    <div className="flex flex-wrap gap-1 mt-2 max-h-24 overflow-y-auto pr-1">
                      {searchedAdvPatients.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setAdvPatientId(p.id)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all flex items-center gap-1 ${
                            advPatientId === p.id
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-emerald-50'
                          }`}
                        >
                          <User className="w-3 h-3" />
                          <span>{p.name}</span>
                          <span className="opacity-75">({p.mrn || 'MRN'})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedAdvPatient ? (
                    <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-xl">
                      <div className="text-xs font-black text-emerald-950 flex items-center justify-between">
                        <span>{selectedAdvPatient.name}</span>
                        <Badge className="bg-emerald-700 text-white text-[10px] font-extrabold">{selectedAdvPatient.mrn}</Badge>
                      </div>
                      <div className="text-[11px] text-emerald-800 mt-1 space-y-0.5 font-medium">
                        <div>Phone: {selectedAdvPatient.phone || 'N/A'} | Age/Gender: {selectedAdvPatient.age || 'N/A'}Y / {selectedAdvPatient.gender || 'N/A'}</div>
                        <div>Address: {selectedAdvPatient.address || 'N/A'}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center justify-center text-center italic">
                      Click a patient chip above to select for advance collection.
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 my-4" />

              {/* STEP 2: ADVANCE DETAILS & SERVICE TYPE */}
              <div className="space-y-4">
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  2. Purpose & Advance Details
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Advance Activity / Department</Label>
                    <select
                      value={advActivityType}
                      onChange={(e) => setAdvActivityType(e.target.value)}
                      className="w-full text-xs h-9 rounded-md border border-emerald-200 bg-white px-3 mt-1 font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="OT / Planned Surgery Deposit">OT / Planned Surgery Deposit</option>
                      <option value="IPD Bed Admission Deposit">IPD Bed / Ward Admission Deposit</option>
                      <option value="Pharmacy & Medication Pre-pay">Pharmacy & Medication Pre-pay</option>
                      <option value="Laboratory & Diagnostic Deposit">Laboratory & Diagnostic Pre-payment</option>
                      <option value="Material & Supply Advance">Material & Supply Advance</option>
                      <option value="OPD & Procedure Advance">OPD & Procedure Advance</option>
                      <option value="General Hospital Deposit">General Hospital Facility Deposit</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Specific Procedure / Surgery / Notes Name</Label>
                    <Input
                      placeholder="e.g. Laparoscopic Cholecystectomy, ICU Deposit..."
                      value={advProcedureName}
                      onChange={(e) => setAdvProcedureName(e.target.value)}
                      className="h-9 text-xs mt-1 border-emerald-200"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-extrabold text-slate-800">Advance Deposit Amount (₹)</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2 text-sm font-black text-emerald-700">₹</span>
                      <Input
                        type="number"
                        step="100"
                        placeholder="e.g. 5000"
                        value={advAmount}
                        onChange={(e) => setAdvAmount(e.target.value)}
                        className="pl-7 h-10 font-black text-base text-emerald-950 border-emerald-300 focus:border-emerald-500 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Expected Date of Service / Admission</Label>
                    <Input
                      type="date"
                      value={advExpectedDate}
                      onChange={(e) => setAdvExpectedDate(e.target.value)}
                      className="h-10 text-xs mt-1 border-emerald-200"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 my-4" />

              {/* STEP 3: PAYMENT MODE & REF */}
              <div className="space-y-4">
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  3. Payment Mode & Reference
                </Label>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {['Cash', 'UPI / QR', 'Credit Card', 'Debit Card', 'Net Banking', 'Cheque / DD'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setAdvPaymentMode(m)}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
                        advPaymentMode === m
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {advPaymentMode !== 'Cash' && (
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Transaction Ref / UTR / Cheque No</Label>
                      <Input
                        placeholder="UTR / Ref Number..."
                        value={advTransactionRef}
                        onChange={(e) => setAdvTransactionRef(e.target.value)}
                        className="h-8 text-xs mt-1 border-emerald-200"
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Payer Name (if relative/attendant)</Label>
                    <Input
                      placeholder="Name of payer..."
                      value={advPayerName}
                      onChange={(e) => setAdvPayerName(e.target.value)}
                      className="h-8 text-xs mt-1 border-emerald-200"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs font-semibold text-slate-700">Counter Remarks / Instructions</Label>
                    <Input
                      placeholder="e.g. Advance received for upcoming laparoscopic surgery on 12th Aug..."
                      value={advRemarks}
                      onChange={(e) => setAdvRemarks(e.target.value)}
                      className="h-8 text-xs mt-1 border-emerald-200"
                    />
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <Button
                onClick={handleProcessAdvanceDeposit}
                disabled={isSubmitting || !selectedAdvPatient || !advAmount}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold py-6 gap-2 shadow-lg shadow-emerald-200 text-sm mt-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Recording Advance Deposit...
                  </>
                ) : (
                  <>
                    <ArrowDownCircle className="w-5 h-5" />
                    Collect Advance Deposit & Issue Counter Voucher
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* COUNTER TRANSACTIONS LEDGER TAB */}
      {activeCounterTab === 'counter-ledger' && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-600" />
                  Centralised Payment Counter Transactions & Books of Accounts
                </CardTitle>
                <CardDescription className="text-xs">
                  Comprehensive audit trail of all payments and advance deposits collected at the central counter.
                </CardDescription>
              </div>
              <Badge className="bg-indigo-100 text-indigo-900 font-black px-3 py-1 text-xs self-start sm:self-auto">
                {filteredLedgerPayments.length} Transaction(s) Logged
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* LEDGER FILTERS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <Label className="text-[11px] font-bold text-slate-700">Search Ledger</Label>
                <Input
                  placeholder="Receipt No, Patient, UTR..."
                  value={ledgerSearchTerm}
                  onChange={(e) => setLedgerSearchTerm(e.target.value)}
                  className="h-8 text-xs mt-1 bg-white"
                />
              </div>

              <div>
                <Label className="text-[11px] font-bold text-slate-700">Date Filter</Label>
                <select
                  value={ledgerDateFilter}
                  onChange={(e) => setLedgerDateFilter(e.target.value)}
                  className="w-full text-xs h-8 rounded-md border border-slate-200 bg-white px-2 mt-1 font-semibold text-slate-800"
                >
                  <option value="today">Today's Transactions</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="all">All Time History</option>
                </select>
              </div>

              <div>
                <Label className="text-[11px] font-bold text-slate-700">Payment Mode</Label>
                <select
                  value={ledgerModeFilter}
                  onChange={(e) => setLedgerModeFilter(e.target.value)}
                  className="w-full text-xs h-8 rounded-md border border-slate-200 bg-white px-2 mt-1 font-semibold text-slate-800"
                >
                  <option value="all">All Modes</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Card">Credit/Debit Card</option>
                  <option value="Bank">Net Banking / NEFT</option>
                  <option value="Cheque">Cheque / DD</option>
                </select>
              </div>

              <div>
                <Label className="text-[11px] font-bold text-slate-700">Department Activity</Label>
                <select
                  value={ledgerDeptFilter}
                  onChange={(e) => setLedgerDeptFilter(e.target.value)}
                  className="w-full text-xs h-8 rounded-md border border-slate-200 bg-white px-2 mt-1 font-semibold text-slate-800"
                >
                  <option value="all">All Departments</option>
                  <option value="IPD / Ward">IPD / Ward</option>
                  <option value="OPD Services">OPD Services</option>
                  <option value="Pharmacy POS">Pharmacy POS</option>
                  <option value="Laboratory / Radiology">Laboratory / Radiology</option>
                  <option value="OT & Surgical">OT & Surgical</option>
                  <option value="Materials & Supplies">Materials & Supplies</option>
                  <option value="OT / Planned Surgery Deposit">OT Surgery Deposit</option>
                  <option value="IPD Bed Admission Deposit">IPD Bed Deposit</option>
                </select>
              </div>
            </div>

            {/* TRANSACTIONS TABLE */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-100">
                  <TableRow className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600">
                    <TableHead>Receipt No / Date</TableHead>
                    <TableHead>Patient / MRN</TableHead>
                    <TableHead>Type & Department</TableHead>
                    <TableHead>Mode & UTR / Ref</TableHead>
                    <TableHead className="text-right">Amount Collected (₹)</TableHead>
                    <TableHead>Cashier</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLedgerPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-xs text-slate-500">
                        <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <div className="font-bold text-slate-700">No Counter Payment Transactions Found</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Collect payments or advance deposits at counter to populate ledger.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLedgerPayments.map((p) => (
                      <TableRow key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <TableCell className="py-3">
                          <div className="font-bold text-indigo-900 text-xs">{p.receiptNo}</div>
                          <div className="text-[10px] text-slate-500">{formatDate(p.date)}</div>
                        </TableCell>

                        <TableCell className="py-3">
                          <div className="font-bold text-slate-800 text-xs">{p.patientName}</div>
                          <div className="text-[10px] text-slate-500">{p.patientMrn ? `MRN: ${p.patientMrn}` : 'Walk-in'}</div>
                        </TableCell>

                        <TableCell className="py-3">
                          <Badge className={`text-[10px] font-extrabold px-2 py-0.5 ${
                            p.transactionType === 'Advance Deposit' 
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                              : 'bg-sky-100 text-sky-800 border-sky-300'
                          }`}>
                            {p.transactionType}
                          </Badge>
                          <div className="text-[10px] text-slate-600 mt-1 font-semibold">{p.department}</div>
                        </TableCell>

                        <TableCell className="py-3">
                          <div className="font-extrabold text-slate-800 text-xs">{p.paymentMode}</div>
                          {p.transactionRef && (
                            <div className="text-[10px] text-sky-700 font-mono">Ref: {p.transactionRef}</div>
                          )}
                        </TableCell>

                        <TableCell className="py-3 text-right">
                          <div className="font-black text-emerald-700 text-sm">₹{Number(p.amountPaid).toFixed(2)}</div>
                        </TableCell>

                        <TableCell className="py-3 text-xs text-slate-600 font-medium">
                          {p.cashierName || 'Cashier'}
                        </TableCell>

                        <TableCell className="py-3 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintReceipt(p)}
                            className="text-[11px] h-7 font-bold text-indigo-700 border-indigo-200 hover:bg-indigo-50 gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            Print Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RECEIPT PREVIEW DIALOG MODAL */}
      {previewReceipt && (
        <Dialog open={!!previewReceipt} onOpenChange={() => setPreviewReceipt(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-sky-950 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-sky-600" />
                Central Counter Receipt #{previewReceipt.receiptNo}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Transaction recorded and merged with Books of Accounts.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Patient Name:</span>
                <span className="font-extrabold text-slate-900">{previewReceipt.patientName} ({previewReceipt.patientMrn})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Type / Dept:</span>
                <span className="font-bold text-sky-800">{previewReceipt.transactionType} - {previewReceipt.department}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Payment Mode:</span>
                <span className="font-bold text-slate-800">{previewReceipt.paymentMode} {previewReceipt.transactionRef ? `(Ref: ${previewReceipt.transactionRef})` : ''}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-700 font-extrabold text-sm">Total Amount Paid:</span>
                <span className="font-black text-emerald-700 text-lg">₹{Number(previewReceipt.amountPaid).toFixed(2)}</span>
              </div>
            </div>

            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button variant="outline" onClick={() => setPreviewReceipt(null)} className="rounded-xl text-xs font-bold">
                Close Window
              </Button>
              <Button
                onClick={() => {
                  handlePrintReceipt(previewReceipt);
                  setPreviewReceipt(null);
                }}
                className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print Official Receipt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
