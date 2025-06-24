"use client";

import {
  initialAppointments,
  dummyCategories,
  dummyPatients,
} from "./local-data";

// Local storage keys
const APPOINTMENTS_KEY = "vocare_appointments";
const CATEGORIES_KEY = "vocare_categories";
const PATIENTS_KEY = "vocare_patients";

// Initialize data if not exists
export function initializeLocalData() {
  if (typeof window === "undefined") return;

  // Initialize appointments
  if (!localStorage.getItem(APPOINTMENTS_KEY)) {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(initialAppointments));
  }

  // Initialize categories
  if (!localStorage.getItem(CATEGORIES_KEY)) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(dummyCategories));
  }

  // Initialize patients
  if (!localStorage.getItem(PATIENTS_KEY)) {
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(dummyPatients));
  }
}

// Appointments CRUD operations
export function getAppointments(filters?: {
  category?: string;
  patient?: string;
  dateRange?: { from?: Date; to?: Date };
}) {
  if (typeof window === "undefined") return [];

  const appointments = JSON.parse(
    localStorage.getItem(APPOINTMENTS_KEY) || "[]"
  );

  // Add related data (categories and patients)
  const categories = getCategories();
  const patients = getPatients();

  const enrichedAppointments = appointments.map((appointment: any) => ({
    ...appointment,
    categories: categories.find((cat: any) => cat.id === appointment.category),
    patients: patients.find(
      (patient: any) => patient.id === appointment.patient
    ),
  }));

  // Apply filters
  let filteredAppointments = enrichedAppointments;

  if (filters?.category && filters.category !== "all") {
    filteredAppointments = filteredAppointments.filter(
      (apt: any) => apt.category === filters.category
    );
  }

  if (filters?.patient && filters.patient !== "all") {
    filteredAppointments = filteredAppointments.filter(
      (apt: any) => apt.patient === filters.patient
    );
  }

  if (filters?.dateRange?.from) {
    filteredAppointments = filteredAppointments.filter((apt: any) => {
      if (!apt.start) return false;
      const appointmentDate = new Date(apt.start);
      return appointmentDate >= filters.dateRange!.from!;
    });
  }

  if (filters?.dateRange?.to) {
    filteredAppointments = filteredAppointments.filter((apt: any) => {
      if (!apt.start) return false;
      const appointmentDate = new Date(apt.start);
      const endOfDay = new Date(filters.dateRange!.to!);
      endOfDay.setHours(23, 59, 59, 999);
      return appointmentDate <= endOfDay;
    });
  }

  return filteredAppointments;
}

export function createAppointment(appointment: {
  title: string;
  category?: string | null;
  patient?: string | null;
  start: string;
  end?: string | null;
  location?: string | null;
  notes?: string | null;
}) {
  if (typeof window === "undefined") return null;

  const appointments = JSON.parse(
    localStorage.getItem(APPOINTMENTS_KEY) || "[]"
  );
  const newAppointment = {
    ...appointment,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  appointments.push(newAppointment);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));

  return newAppointment;
}

export function updateAppointment(
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
  if (typeof window === "undefined") return null;

  const appointments = JSON.parse(
    localStorage.getItem(APPOINTMENTS_KEY) || "[]"
  );
  const index = appointments.findIndex((apt: any) => apt.id === id);

  if (index !== -1) {
    appointments[index] = {
      ...appointments[index],
      ...appointment,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    return appointments[index];
  }

  return null;
}

export function deleteAppointment(id: string) {
  if (typeof window === "undefined") return;

  const appointments = JSON.parse(
    localStorage.getItem(APPOINTMENTS_KEY) || "[]"
  );
  const filteredAppointments = appointments.filter((apt: any) => apt.id !== id);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(filteredAppointments));
}

// Categories operations
export function getCategories() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(CATEGORIES_KEY) || "[]");
}

// Patients operations
export function getPatients() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(PATIENTS_KEY) || "[]");
}
