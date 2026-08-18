import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'N/A';
  }
}

export function getAppointmentTimestamp(dateVal: any, timeVal: any): number {
  let dateStr = '';
  if (dateVal) {
    if (typeof dateVal === 'string') {
      dateStr = dateVal.split('T')[0];
    } else if (dateVal instanceof Date) {
      dateStr = dateVal.toISOString().split('T')[0];
    } else {
      dateStr = new Date(dateVal).toISOString().split('T')[0];
    }
  } else {
    dateStr = '1970-01-01';
  }

  let timeStr = typeof timeVal === 'string' ? timeVal : '12:00 AM';
  let hours = 12;
  let minutes = 0;

  // Attempt to parse standard 12-hour AM/PM format (e.g. "10:30 AM")
  const match12h = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match12h) {
    hours = parseInt(match12h[1], 10);
    minutes = parseInt(match12h[2], 10);
    const ampm = match12h[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
  } else {
    // Attempt to parse 24-hour format (e.g. "14:30")
    const match24h = timeStr.match(/(\d+):(\d+)/);
    if (match24h) {
      hours = parseInt(match24h[1], 10);
      minutes = parseInt(match24h[2], 10);
    }
  }

  const dt = new Date(dateStr);
  dt.setHours(hours, minutes, 0, 0);
  return dt.getTime();
}

export function generateSequentialInvoiceNumber(prefix: string = 'INV', serialIndex: number = 1): string {
  const seqStr = String(serialIndex).padStart(4, '0');
  return `${prefix}-${seqStr}`;
}

export function getCleanDateString(raw: any): string {
  if (!raw) return '';
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    // YYYY-MM-DD (e.g. 2026-08-16 or 2026-08-16T10:00:00Z)
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
    // DD-MM-YYYY or DD/MM/YYYY (e.g. 16-08-2026 or 16/08/2026)
    const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }
    // YYYY/MM/DD
    const ymdSlash = trimmed.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
    if (ymdSlash) {
      const year = ymdSlash[1];
      const month = ymdSlash[2].padStart(2, '0');
      const day = ymdSlash[3].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    if (trimmed.includes('T')) return trimmed.split('T')[0];
    if (trimmed.includes(' ')) {
      const first = trimmed.split(' ')[0];
      if (/^\d{4}-\d{2}-\d{2}/.test(first)) return first;
    }
  }
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {}
  return '';
}

export function generateDateWiseInvoiceNumber(prefix: string = 'INV', _dateInput?: string | Date, serialIndex: number = 1): string {
  return generateSequentialInvoiceNumber(prefix, serialIndex);
}

export function getDepartmentPrefix(bill: any): string {
  if (!bill) return 'INV';
  const type = String(bill.type || bill.invoice_type || bill.department || '').toUpperCase();
  const num = String(bill.invoice_number || bill.invoiceNumber || bill.invoice_no || bill.invoiceNo || '').toUpperCase();
  
  if (type === 'PHARMACY' || type === 'PHARM' || num.startsWith('PHARM') || num.startsWith('INV-PHARM') || num.startsWith('INV-POS')) {
    return 'PHARM';
  }
  if (type === 'OPD' || num.startsWith('OPD') || num.startsWith('INV-OPD')) {
    return 'OPD';
  }
  if (type === 'IPD' || num.startsWith('IPD') || num.startsWith('INV-IPD')) {
    return 'IPD';
  }
  if (type === 'LAB' || type === 'PATHOLOGY' || num.startsWith('LAB') || num.startsWith('INV-LAB')) {
    return 'LAB';
  }
  if (type === 'RADIO' || type === 'RADIOLOGY' || num.startsWith('RADIO') || num.startsWith('INV-RADIO')) {
    return 'RADIO';
  }
  if (type === 'OT' || type === 'SURGERY' || num.startsWith('OT') || num.startsWith('INV-OT')) {
    return 'OT';
  }
  if (type === 'EMERGENCY' || type === 'CASUALTY' || num.startsWith('EMERG') || num.startsWith('INV-EMERG')) {
    return 'EMERG';
  }
  if (type === 'DENTAL' || num.startsWith('DENT')) {
    return 'DENT';
  }
  return 'INV';
}

export function buildDepartmentWiseInvoiceMap(bills: any[], startNum: number = 1): Record<string, string> {
  const map: Record<string, string> = {};
  if (!Array.isArray(bills) || bills.length === 0) return map;

  // Filter valid bills
  const validBills = bills.filter((b) => {
    if (!b || b.isExpense || String(b.id || '').startsWith('exp') || String(b.id || '').startsWith('note-')) return false;
    return true;
  });

  // Group by department prefix
  const groups: Record<string, any[]> = {};
  validBills.forEach((b) => {
    const prefix = getDepartmentPrefix(b);
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(b);
  });

  // Sort and assign serial numbers within each department
  Object.keys(groups).forEach((prefix) => {
    const sorted = [...groups[prefix]].sort((a, b) => {
      const ta = new Date(a.created_at || a.date || a.createdDate || 0).getTime();
      const tb = new Date(b.created_at || b.date || b.createdDate || 0).getTime();
      if (ta !== tb) return (isNaN(ta) ? 0 : ta) - (isNaN(tb) ? 0 : tb);
      return String(a.id || '').localeCompare(String(b.id || ''));
    });

    sorted.forEach((bill, idx) => {
      const seqNum = startNum + idx;
      const padded = String(seqNum).padStart(4, '0');
      map[bill.id] = `${prefix}-${padded}`;
    });
  });

  return map;
}

export function buildSequentialInvoiceMap(bills: any[], prefix: string = 'INV', startNum: number = 1): Record<string, string> {
  const map: Record<string, string> = {};
  if (!Array.isArray(bills) || bills.length === 0) return map;

  // Filter valid billing items
  const validBills = bills.filter((b) => {
    if (!b || b.isExpense || String(b.id || '').startsWith('exp') || String(b.id || '').startsWith('note-')) return false;
    return true;
  });

  // Sort chronologically (oldest to newest) to assign 1, 2, 3...
  const sorted = [...validBills].sort((a, b) => {
    const ta = new Date(a.created_at || a.date || a.createdDate || 0).getTime();
    const tb = new Date(b.created_at || b.date || b.createdDate || 0).getTime();
    if (ta !== tb) return (isNaN(ta) ? 0 : ta) - (isNaN(tb) ? 0 : tb);
    return String(a.id || '').localeCompare(String(b.id || ''));
  });

  sorted.forEach((bill, idx) => {
    const seqNum = startNum + idx;
    const padded = String(seqNum).padStart(4, '0');
    map[bill.id] = `${prefix}-${padded}`;
  });

  return map;
}

export function buildDateWiseInvoiceMap(bills: any[], prefix: string = 'INV'): Record<string, string> {
  return buildSequentialInvoiceMap(bills, prefix);
}



