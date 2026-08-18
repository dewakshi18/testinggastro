import { storage, STORAGE_KEYS } from '../lib/storage';

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'DOCTOR' 
  | 'RECEPTIONIST' 
  | 'RECEPTION'
  | 'FRONT_DESK'
  | 'NURSE' 
  | 'LAB_STAFF' 
  | 'PHARMACIST' 
  | 'ACCOUNTANT'
  | 'ACCOUNTS'
  | 'SURGEON'
  | 'RADIOLOGIST'
  | 'PATHOLOGIST';

// Normalizes role names to handle spelling differences/upper/lower cases
export const normalizeRole = (role: string | undefined | null): string => {
  if (!role) return '';
  const r = role.toUpperCase().trim().replace(/_/g, '').replace(/ /g, '');
  if (r === 'SUPERADMIN' || r === 'ADMIN' || r === 'HOSPITALADMIN') return 'ADMIN';
  if (r === 'RECEPTION' || r === 'RECEPTIONIST' || r === 'FRONTDESK' || r === 'FRONTOFFICE') return 'RECEPTIONIST';
  if (r === 'ACCOUNTANT' || r === 'ACCOUNTS' || r === 'FINANCE') return 'ACCOUNTANT';
  if (r === 'DOCTOR' || r === 'SURGEON') return 'DOCTOR';
  if (r === 'LABSTAFF' || r === 'LAB' || r === 'PATHOLOGIST' || r === 'RADIOLOGIST') return 'LAB_STAFF';
  return r;
};

// Returns whether the current user role is an Admin
export const isUserAdmin = (role: string | undefined | null): boolean => {
  const norm = normalizeRole(role);
  return norm === 'ADMIN';
};

// Checks if a record was created by an admin
export const isRecordCreatedByAdmin = (record: any): boolean => {
  if (!record) return false;
  if (record.created_by_admin === true || record.createdByAdmin === true) return true;
  const role = record.created_by_role || record.createdByRole;
  if (role && isUserAdmin(role)) return true;
  return false;
};

// Checks if a user has permission to edit/delete a specific record - Fully active for all users and devices
export const canUserEditRecord = (record: any, currentUser: any): boolean => {
  return true;
};

export const canUserModifyRecord = (record: any, currentUser: any, users?: any[]): boolean => {
  return true;
};

// Check if a user has access to view a specific menu - Fully active for all submenus and pages
export const hasMenuAccess = (path: string, userRole: string | undefined | null): boolean => {
  return true;
};

// Returns whether the current user role can view general financial figures and graphs - Active across all panels
export const canUserViewFinancials = (userRole: string | undefined | null): boolean => {
  return true;
};

// Checks if specific clinical fields/forms (like prescription entry) are editable/visible - Fully active
export const canUserEditClinicalData = (userRole: string | undefined | null): boolean => {
  return true;
};

// Checks if specific billing operations (refund, discount, edit invoice) are allowed - Fully active
export const canUserManageBilling = (userRole: string | undefined | null): boolean => {
  return true;
};
