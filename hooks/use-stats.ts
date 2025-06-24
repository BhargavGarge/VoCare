"use client";

import { useState, useEffect } from "react";
import { getAppointmentStats } from "@/lib/supabase";

export function useStats() {
  const [stats, setStats] = useState({
    todayCount: 0,
    weekCount: 0,
    activePatients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAppointmentStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}
