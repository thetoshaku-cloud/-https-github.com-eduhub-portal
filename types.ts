

export enum InstitutionType {
  UNIVERSITY = 'University',
  TECHNICAL_UNIVERSITY = 'University of Technology',
  TVET = 'TVET College',
  PRIVATE_COLLEGE = 'Private College'
}

export interface Course {
  name: string;
  prerequisites: string[];
}

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  location: string;
  description: string;
  courses: Course[];
  logoPlaceholder: string;
  contact: {
    phone: string;
    email: string;
    website: string;
  };
}

export interface UploadedDocument {
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  dataUrl?: string; // Base64 data for preview
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  email: string;
  phone: string;
  province: string;
  gender?: string;
  ethnicity?: string;
  highSchoolName: string;
  registeredAt: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: 'super_admin' | 'editor';
}

export interface SubjectMark {
  name: string;
  percentage: number;
}

export interface ApplicationFormData {
  profilePicture?: UploadedDocument;
  firstName: string;
  lastName: string;
  pronouns: string; 
  gender: string; // Added
  ethnicity: string; // Added
  idNumber: string;
  email: string;
  phone: string;
  province: string;
  subjects: SubjectMark[]; // Changed from fixed marks object
  nsfasRequired: boolean;
  householdIncome: number;
  sassaBeneficiary: boolean;
  selectedInstitutions: string[]; // IDs
  selectedCourses: Record<string, string>; // Map of InstitutionID -> CourseName
  documents: {
    idDocument?: UploadedDocument;
    academicRecord?: UploadedDocument;
    proofOfIncome?: UploadedDocument; // Conditional based on NSFAS
  };
}

export interface ApplicationRecord extends ApplicationFormData {
  id: string;
  submittedAt: string;
  status: 'submitted' | 'draft';
  userId?: string; // Link to user
}

export interface AuditLog {
  id: string;
  event_type: string;
  user_id: string;
  ip_address: string;
  details: Record<string, any>;
  created_at: string;
}

export type ViewState = 'landing' | 'institutions' | 'apply' | 'dashboard' | 'assistant' | 'login' | 'register' | 'admin';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}