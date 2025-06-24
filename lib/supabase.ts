import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = "https://sljilzeejvapihghhcrs.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsamlsemVlanZhcGloZ2hoY3JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTA2NjAsImV4cCI6MjA2NDM2NjY2MH0.jYTTW1cj3EQLPqVpgKqwV18kvujMjLpy7oVZq7THPTQ";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database Types
export interface Category {
  id: string;
  label: string;
  color: string;
  icon?: string | null;
  description?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface Patient {
  id: string;
  firstname: string;
  lastname: string;
  birth_date?: string | null;
  care_level?: number | null;
  pronoun?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  emergency_contact?: string | null;
  medical_notes?: string | null;
  active: boolean;
  active_since?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface Appointment {
  id: string;
  title: string;
  start: string;
  end?: string | null;
  location?: string | null;
  notes?: string | null;
  status?: "scheduled" | "completed" | "cancelled" | "no_show";
  category?: string | null;
  patient?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at?: string | null;
  categories?: Pick<
    Category,
    "id" | "label" | "color" | "icon" | "description"
  >;
  patients?: Pick<
    Patient,
    "id" | "firstname" | "lastname" | "care_level" | "pronoun"
  >;
}

// Appointments CRUD operations
export async function getAppointments(filters?: {
  category?: string | null;
  patient?: string | null;
  dateRange?: { from?: Date; to?: Date };
}) {
  try {
    let query = supabase
      .from("appointments")
      .select(
        `
        *,
        categories:category(id, label, color, icon, description),
        patients:patient(id, firstname, lastname, care_level, pronoun)
      `
      )
      .order("start", { ascending: true });

    // Apply filters
    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.patient) {
      query = query.eq("patient", filters.patient);
    }

    if (filters?.dateRange?.from) {
      query = query.gte("start", filters.dateRange.from.toISOString());
    }

    if (filters?.dateRange?.to) {
      const endOfDay = new Date(filters.dateRange.to);
      endOfDay.setHours(23, 59, 59, 999);
      query = query.lte("start", endOfDay.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
}

export async function createAppointment(appointment: {
  title: string;
  category?: string | null;
  patient?: string | null;
  start: string;
  end?: string | null;
  location?: string | null;
  notes?: string | null;
}) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .insert([
        {
          title: appointment.title,
          category: appointment.category,
          patient: appointment.patient,
          start: appointment.start,
          end: appointment.end,
          location: appointment.location,
          notes: appointment.notes,
        },
      ])
      .select(
        `
        *,
        categories:category(id, label, color, icon, description),
        patients:patient(id, firstname, lastname, care_level, pronoun)
      `
      )
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
}

export async function updateAppointment(
  id: string,
  appointment: {
    title: string;
    category?: string | null;
    patient?: string | null;
    start: string;
    end?: string | null;
    location?: string | null;
    notes?: string | null;
  }
) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        title: appointment.title,
        category: appointment.category,
        patient: appointment.patient,
        start: appointment.start,
        end: appointment.end,
        location: appointment.location,
        notes: appointment.notes,
      })
      .eq("id", id)
      .select(
        `
        *,
        categories:category(id, label, color, icon, description),
        patients:patient(id, firstname, lastname, care_level, pronoun)
      `
      )
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
}

export async function deleteAppointment(id: string) {
  try {
    const { error } = await supabase.from("appointments").delete().eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting appointment:", error);
    throw error;
  }
}

// Categories operations
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("label", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

// Patients operations
export async function getPatients() {
  try {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("active", true)
      .order("lastname", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching patients:", error);
    throw error;
  }
}

// Statistics functions
export async function getAppointmentStats() {
  try {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const [
      { count: todayCount },
      { count: weekCount },
      { count: activePatients },
    ] = await Promise.all([
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .gte("start", startOfToday.toISOString())
        .lt("start", endOfToday.toISOString()),
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .gte("start", startOfWeek.toISOString())
        .lt("start", endOfWeek.toISOString()),
      supabase
        .from("patients")
        .select("id", { count: "exact", head: true })
        .eq("active", true),
    ]);

    return {
      todayCount: todayCount || 0,
      weekCount: weekCount || 0,
      activePatients: activePatients || 0,
    };
  } catch (error) {
    console.error("Error fetching statistics:", error);
    throw error;
  }
}
