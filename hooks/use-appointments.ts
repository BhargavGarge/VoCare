"use client";

import { useState, useEffect } from "react";
import { getAppointments } from "@/lib/supabase";

export function useAppointments(filters: {
  category: string;
  patient: string;
  dateRange: { from?: Date; to?: Date };
}) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const data = await getAppointments(filters);
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [filters]);

  return {
    appointments,
    loading,
    refetch: async () => {
      const data = await getAppointments(filters);
      setAppointments(data);
    },
  };
}
