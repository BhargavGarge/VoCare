// src/types/db.ts

export type Appointment = {
  id: string;
  created_at: string;
  updated_at?: string;
  start: string;
  end: string;
  location: string;
  patient: string;
  attachments?: any[]; // Could adjust based on data
  category: string;
  notes: string;
  title: string;
};

export type Patient = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  birth_date: string;
  active: boolean;
  active_since: string;
  pronoun: string;
  care_level: number;
};

export type Category = {
  id: string;
  label: string;
  description: string;
  color: string;
  icon: string;
};
