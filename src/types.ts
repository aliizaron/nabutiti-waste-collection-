/**
 * Types & Domain Models
 * Web-Based Waste Collection Management and Monitoring System
 * Case Study of Nabutiti Village, Kansanga, Kampala
 */

export type UserRole = 'resident' | 'collector' | 'admin' | 'leader';

export type WasteCategory = 'Organic' | 'Recyclable' | 'Hazardous' | 'General';

export type RequestStatus = 'Pending' | 'Assigned' | 'In_Progress' | 'Completed' | 'Overdue' | 'Cancelled' | 'Inaccessible';

export type SubZone = 'Zone A' | 'Zone B' | 'Central' | 'Valley';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'closed';
  created_at: string;
}

export interface ResidentProfile {
  id: number;
  user_id: number;
  household_no: string;
  zone_name: SubZone;
  landmark: string;
}

export interface CollectorProfile {
  id: number;
  user_id: number;
  vehicle_reg_no: string;
  assigned_zone: SubZone | 'All';
  is_available: boolean;
}

export interface WasteRequest {
  id: number;
  resident_id: number;
  resident_name?: string;
  household_no?: string;
  zone_name?: SubZone;
  phone?: string;
  waste_type: WasteCategory;
  description: string;
  latitude: number;
  longitude: number;
  address_landmark: string;
  photo_path?: string;
  scheduled_date: string;
  status: RequestStatus;
  created_at: string;
  
  // Assignment & Completion metadata
  collector_id?: number;
  collector_name?: string;
  vehicle_reg_no?: string;
  assigned_at?: string;
  completion_time?: string;
  proof_photo?: string;
  collector_notes?: string;
}

export interface DumpingReport {
  id: number;
  reporter_id: number;
  reporter_name?: string;
  location_desc: string;
  latitude: number;
  longitude: number;
  photo_path?: string;
  status: 'Reported' | 'Investigating' | 'Cleared';
  created_at: string;
}

export interface Complaint {
  id: number;
  resident_id: number;
  resident_name?: string;
  household_no?: string;
  zone_name?: SubZone;
  request_id?: number;
  complaint_text: string;
  status: 'Open' | 'Under_Review' | 'Resolved';
  admin_response?: string;
  resolved_at?: string;
  created_at?: string;
}

export interface ActivityLog {
  id: number;
  user_id?: number;
  user_name?: string;
  action: string;
  ip_address: string;
  created_at: string;
}

export interface CollectionPoint {
  id: string;
  name: string;
  zone: SubZone;
  landmark: string;
  latitude: number;
  longitude: number;
  wasteAccepted: WasteCategory[];
  openingHours: string;
  managedBy: string;
  contact: string;
  status: 'Open' | 'Full' | 'Maintenance';
}
