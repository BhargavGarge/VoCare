"use client";

import { useState, useEffect } from "react";
import { getPatients } from "@/lib/supabase";

export function usePatients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getPatients();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return { patients, loading };
}
