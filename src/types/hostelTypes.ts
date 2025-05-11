

// Custom types for hostel management system
// These types mirror the database schema but allow us to extend them as needed

export interface Room {
  id: string;
  room_no: string;
  type: string;
  floor: string;
  capacity: number;
  occupancy: number;
  rent: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Resident {
  id: string;
  name: string;
  room_id: string | null;
  phone: string;
  email: string | null;
  join_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  date_of_birth?: string | null;
  gender?: string | null;
  security_deposit?: number | null;
  pg_location?: string | null;
}

export interface ElectricityReading {
  id: string;
  room_id: string;
  previous_reading: number;
  current_reading: number;
  units: number;
  rate: number;
  amount: number;
  reading_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: string;
  invoice_id: string;
  resident_id: string;
  amount: number;
  details: string | null;
  bill_date: string;
  due_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}
