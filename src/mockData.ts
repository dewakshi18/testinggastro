import { Patient, Appointment, User, Bed, BillingRecord, LabTest, InventoryItem, OperationTheatre, OperationRecord, NursingTask, NurseShift, PatientVitals, Prescription } from './types';

export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Dr. Rajesh Sharma', 
    email: 'dr.sharma@hospital.com', 
    role: 'DOCTOR', 
    department: 'Cardiology', 
    specialization: 'Interventional Cardiology & Senior Physician', 
    specialty: 'Interventional Cardiology & Senior Physician',
    degree: 'MD, DM (Cardiology)', 
    qualification: 'MD, DM (Cardiology)',
    experience: '14 Years',
    registrationNo: 'MCI-2012-4489',
    regNo: 'MCI-2012-4489',
    consultationFee: 500,
    phone: '+91 9876543210',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh' 
  },
  { 
    id: 'u2', 
    name: 'Dr. Ramesh Mehta (Admin)', 
    email: 'admin@hospital.com', 
    role: 'SUPER_ADMIN', 
    department: 'Administration', 
    specialization: 'Hospital Management & Operations', 
    specialty: 'Hospital Management & Operations',
    degree: 'MHA, MD', 
    qualification: 'MHA, MD',
    experience: '18 Years',
    registrationNo: 'MCI-2008-1122',
    regNo: 'MCI-2008-1122',
    consultationFee: 0,
    phone: '+91 9876543211',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' 
  },
  { 
    id: 'u3', 
    name: 'Dr. Priya Nair', 
    email: 'dr.priya@hospital.com', 
    role: 'DOCTOR', 
    department: 'General Medicine', 
    specialization: 'Internal Medicine / Consultant Physician', 
    specialty: 'Internal Medicine / Consultant Physician',
    degree: 'MBBS, MD (Medicine)', 
    qualification: 'MBBS, MD (Medicine)',
    experience: '10 Years',
    registrationNo: 'MCI-2016-8821',
    regNo: 'MCI-2016-8821',
    consultationFee: 400,
    phone: '+91 9876543212',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' 
  },
  { 
    id: 'u4', 
    name: 'Dr. Ananya Sen', 
    email: 'dr.ananya@hospital.com', 
    role: 'DOCTOR', 
    department: 'Pediatrics', 
    specialization: 'Pediatrician & Neonatologist', 
    specialty: 'Pediatrician & Neonatologist',
    degree: 'MD (Pediatrics), DCH', 
    qualification: 'MD (Pediatrics), DCH',
    experience: '8 Years',
    registrationNo: 'MCI-2018-9923',
    regNo: 'MCI-2018-9923',
    consultationFee: 450,
    phone: '+91 9876543213',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya' 
  },
  { 
    id: 'u5', 
    name: 'Dr. Vikram Malhotra', 
    email: 'dr.vikram@hospital.com', 
    role: 'DOCTOR', 
    department: 'Orthopedics', 
    specialization: 'Joint Replacement & Spine Specialist', 
    specialty: 'Joint Replacement & Spine Specialist',
    degree: 'MS (Ortho), DNB', 
    qualification: 'MS (Ortho), DNB',
    experience: '12 Years',
    registrationNo: 'MCI-2014-1120',
    regNo: 'MCI-2014-1120',
    consultationFee: 600,
    phone: '+91 9876543214',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram' 
  },
  { 
    id: 'u6', 
    name: 'Dr. Sunita Rao', 
    email: 'dr.sunita@hospital.com', 
    role: 'DOCTOR', 
    department: 'Gynecology', 
    specialization: 'Obstetrics & High-Risk Pregnancy', 
    specialty: 'Obstetrics & High-Risk Pregnancy',
    degree: 'MS (OBG), FICOG', 
    qualification: 'MS (OBG), FICOG',
    experience: '15 Years',
    registrationNo: 'MCI-2011-3391',
    regNo: 'MCI-2011-3391',
    consultationFee: 500,
    phone: '+91 9876543215',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita' 
  },
  { 
    id: 'u7', 
    name: 'Dr. Rameshwar Prasad', 
    email: 'dr.rameshwar@hospital.com', 
    role: 'DOCTOR', 
    department: 'Gastroenterology', 
    specialization: 'Gastroenterologist & Therapeutic Endoscopist', 
    specialty: 'Gastroenterologist & Therapeutic Endoscopist',
    degree: 'MD, DM (Gastroenterology)', 
    qualification: 'MD, DM (Gastroenterology)',
    experience: '16 Years',
    registrationNo: 'MCI-2010-7744',
    regNo: 'MCI-2010-7744',
    consultationFee: 700,
    phone: '+91 9876543216',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rameshwar' 
  },
  { 
    id: 'u8', 
    name: 'Dr. Amit Deshmukh', 
    email: 'dr.amit@hospital.com', 
    role: 'DOCTOR', 
    department: 'General Surgery', 
    specialization: 'Laparoscopic & General Surgeon', 
    specialty: 'Laparoscopic & General Surgeon',
    degree: 'MS (Surgery), FIAGES', 
    qualification: 'MS (Surgery), FIAGES',
    experience: '11 Years',
    registrationNo: 'MCI-2015-6655',
    regNo: 'MCI-2015-6655',
    consultationFee: 650,
    phone: '+91 9876543217',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit' 
  },
  { 
    id: 'u9', 
    name: 'Dr. Arvind Kumar Sharma', 
    email: 'dr.aksharma@hospital.com', 
    role: 'DOCTOR', 
    department: 'Visiting Consultant', 
    specialization: 'Consultant Gastroenterologist', 
    specialty: 'Consultant Gastroenterologist',
    degree: 'MD, DM (Gastro)', 
    qualification: 'MD, DM (Gastro)',
    experience: '20 Years',
    registrationNo: 'MCI-2006-2233',
    regNo: 'MCI-2006-2233',
    consultationFee: 800,
    phone: '+91 9876543218',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arvind' 
  },
  {
    id: 'u10',
    name: 'Sister Priya S.',
    email: 'nurse.priya@hospital.com',
    role: 'NURSE',
    department: 'General Ward / IPD',
    specialization: 'Critical Care & Ward Management',
    specialty: 'Critical Care & Ward Management',
    degree: 'B.Sc Nursing',
    qualification: 'B.Sc Nursing',
    experience: '6 Years',
    registrationNo: 'INC-2020-5512',
    regNo: 'INC-2020-5512',
    phone: '+91 9876543219',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SisterPriya'
  },
  {
    id: 'u11',
    name: 'Nurse Sunita R.',
    email: 'nurse.sunita@hospital.com',
    role: 'NURSE',
    department: 'ICU & Emergency',
    specialization: 'ICU / Emergency Nursing',
    specialty: 'ICU / Emergency Nursing',
    degree: 'GNM, Post Basic B.Sc',
    qualification: 'GNM, Post Basic B.Sc',
    experience: '9 Years',
    registrationNo: 'INC-2017-3341',
    regNo: 'INC-2017-3341',
    phone: '+91 9876543220',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NurseSunita'
  },
  {
    id: 'u12',
    name: 'Vikram Lab Tech',
    email: 'lab.vikram@hospital.com',
    role: 'LAB_TECHNICIAN',
    department: 'Pathology & Biochemistry',
    specialization: 'Senior Medical Laboratory Technologist',
    specialty: 'Senior Medical Laboratory Technologist',
    degree: 'DMLT, B.Sc MLT',
    qualification: 'DMLT, B.Sc MLT',
    experience: '7 Years',
    registrationNo: 'MLT-2019-8877',
    regNo: 'MLT-2019-8877',
    labLicenseNo: 'LAB-LIC-2022-9901',
    licenseNumber: 'LAB-LIC-2022-9901',
    phone: '+91 9876543221',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VikramLab'
  },
  {
    id: 'u13',
    name: 'Rahul Receptionist',
    email: 'reception@hospital.com',
    role: 'RECEPTION',
    department: 'Front Desk & Billing',
    specialization: 'Patient Intake & Registration Specialist',
    specialty: 'Patient Intake & Registration Specialist',
    degree: 'B.Com, Hospital Administration Dip.',
    qualification: 'B.Com, Hospital Administration Dip.',
    experience: '4 Years',
    registrationNo: 'EMP-REC-001',
    regNo: 'EMP-REC-001',
    phone: '+91 9876543222',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RahulRec'
  }
];

export const MOCK_PATIENTS: Patient[] = [];

export const MOCK_BEDS: Bed[] = [
  { id: 'b1', number: '101', ward: 'General Ward A', type: 'General', status: 'Available' },
  { id: 'b2', number: '102', ward: 'General Ward A', type: 'General', status: 'Available' },
  { id: 'b3', number: '201', ward: 'ICU', type: 'ICU', status: 'Available' },
  { id: 'b4', number: 'M1', ward: 'Maternity', type: 'Maternity', status: 'Available' },
];

export const MOCK_APPOINTMENTS: Appointment[] = [];

export const MOCK_BILLING: any[] = [];

export const MOCK_INVENTORY: InventoryItem[] = [
  { 
    id: 'i1', 
    name: 'Paracetamol 500mg', 
    category: 'Medicine', 
    stock: 500, 
    unit: 'Tablets', 
    minStockLevel: 100, 
    expiryDate: '2025-12-31',
    mrp: 15.50,
    sellingPrice: 12.00,
    purchasePrice: 8.00,
    taxPercentage: 12,
    hsnCode: '3004',
    rackNumber: 'A-101'
  },
  { 
    id: 'i2', 
    name: 'Amoxicillin 250mg', 
    category: 'Medicine', 
    stock: 50, 
    unit: 'Capsules', 
    minStockLevel: 100, 
    expiryDate: '2024-08-15',
    mrp: 45.00,
    sellingPrice: 40.00,
    purchasePrice: 30.00,
    taxPercentage: 12,
    hsnCode: '3004',
    rackNumber: 'B-202'
  },
  { 
    id: 'i3', 
    name: 'Moxikind-CV 625', 
    category: 'Medicine', 
    stock: 90, 
    unit: 'Strips', 
    minStockLevel: 10, 
    expiryDate: '2025-08-31',
    mrp: 150.00,
    sellingPrice: 120.00,
    purchasePrice: 80.00,
    taxPercentage: 12,
    hsnCode: '3004',
    rackNumber: 'B-902',
    batchNumber: 'B-902',
    composition: 'Amoxicillin + Clavulanic Acid',
    units_per_strip: 10,
    loose_selling_price: 12.00,
    loose_stock: 0,
    is_loose_sale_enabled: true
  },
  {
    id: 'i4',
    name: 'crocin',
    category: 'Medicine',
    stock: 20,
    unit: 'Strips',
    minStockLevel: 10,
    expiryDate: '2030-01-01',
    mrp: 55.00,
    sellingPrice: 52.00,
    purchasePrice: 26.00,
    taxPercentage: 12,
    hsnCode: '3004',
    rackNumber: 'N/A',
    batchNumber: '26',
    composition: 'Amoxicillin + Clavulanic Acid',
    units_per_strip: 10,
    loose_selling_price: 9.00,
    loose_stock: 80,
    is_loose_sale_enabled: true
  },
];

export const MOCK_THEATRES: OperationTheatre[] = [
  { id: 'ot1', name: 'OT-01 (Major)', status: 'Available', type: 'Major' },
  { id: 'ot2', name: 'OT-02 (Cardiac)', status: 'Occupied', type: 'Cardiac' },
  { id: 'ot3', name: 'OT-03 (Minor)', status: 'Maintenance', type: 'Minor' },
];

export const MOCK_OPERATION_RECORDS: OperationRecord[] = [];

export const MOCK_NURSING_TASKS: NursingTask[] = [];

export const MOCK_NURSE_SHIFTS: NurseShift[] = [];

export const MOCK_PATIENT_VITALS: PatientVitals[] = [];

export const MOCK_PRESCRIPTIONS: Prescription[] = [];

export const MOCK_PHARMACY_BILLING: BillingRecord[] = [];

export const MOCK_LAB_TESTS = [
  { id: 'lt1', name: 'Complete Blood Count (CBC)', category: 'Pathology', price: 450 },
  { id: 'lt2', name: 'Liver Function Test (LFT)', category: 'Pathology', price: 1200 },
  { id: 'lt3', name: 'Kidney Function Test (KFT)', category: 'Pathology', price: 1100 },
  { id: 'lt4', name: 'Blood Sugar (F/PP)', category: 'Pathology', price: 200 },
  { id: 'lt5', name: 'Lipid Profile', category: 'Pathology', price: 850 },
  { id: 'lt6', name: 'Thyroid Profile (T3, T4, TSH)', category: 'Pathology', price: 950 },
  { id: 'lt7', name: 'Chest X-Ray', category: 'Radiology', price: 600 },
  { id: 'lt8', name: 'USG Whole Abdomen', category: 'Radiology', price: 1500 },
  { id: 'lt9', name: 'CT Scan Brain', category: 'Radiology', price: 4500 },
  { id: 'lt10', name: 'MRI Spine', category: 'Radiology', price: 8500 },
];

export const MOCK_BED_RATES = [
  { type: 'General', rate: 1500 },
  { type: 'Semi-Private', rate: 3000 },
  { type: 'Private', rate: 5000 },
  { type: 'ICU', rate: 8000 },
  { type: 'Maternity', rate: 4000 },
];

export const MOCK_OT_RATES = [
  { type: 'Minor', rate: 5000 },
  { type: 'Major', rate: 15000 },
  { type: 'Cardiac', rate: 45000 },
  { type: 'Neuro', rate: 55000 },
];

export const MOCK_MATERIAL_RATES = [
  { name: 'Surgical Gloves', price: 150, category: 'Disposable' },
  { name: 'Syringes (Pack of 10)', price: 100, category: 'Disposable' },
  { name: 'IV Fluid Set', price: 450, category: 'Disposable' },
  { name: 'Cotton / Bandage Kit', price: 200, category: 'Material' },
  { name: 'Disinfectant Solution', price: 350, category: 'Material' },
  { name: 'Catheter Set', price: 850, category: 'Disposable' },
];

export const MOCK_ENDO_RATES: Record<string, { baseFee: number; sedationFee: number; kitFee: number; category: 'Endoscopy' | 'Colonoscopy' | 'ERCP' | 'Polypectomy' | 'EVL Banding' | 'Sigmoidoscopy' | 'Minor GI Procedure' }> = {
  'Upper GI Diagnostic Endoscopy (EGD)': { baseFee: 3500, sedationFee: 0, kitFee: 0, category: 'Endoscopy' },
  'Therapeutic Endoscopy (EVL Banding / Variceal Ligation)': { baseFee: 8500, sedationFee: 0, kitFee: 0, category: 'EVL Banding' },
  'Diagnostic Colonoscopy': { baseFee: 5500, sedationFee: 0, kitFee: 0, category: 'Colonoscopy' },
  'Colonoscopy + Polypectomy': { baseFee: 9500, sedationFee: 0, kitFee: 0, category: 'Polypectomy' },
  'ERCP (Diagnostic / Stenting / Biliary)': { baseFee: 18000, sedationFee: 0, kitFee: 0, category: 'ERCP' },
  'Flexible Sigmoidoscopy': { baseFee: 3000, sedationFee: 0, kitFee: 0, category: 'Sigmoidoscopy' },
  'Endoscopic Foreign Body Removal': { baseFee: 6500, sedationFee: 0, kitFee: 0, category: 'Minor GI Procedure' },
  'Capsule Endoscopy': { baseFee: 22000, sedationFee: 0, kitFee: 0, category: 'Endoscopy' },
};

