// src/app/debug/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DebugPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const AppData = async () => {
      const { data, error } = await supabase.from("appointments").select("*");
      console.log("Appointments Data:", data);
      if (error) console.error(error);
      setData(data || []);
    };
    const PatientsData = async () => {
      const { data, error } = await supabase.from("patients").select("*");
      console.log("Patients Data:", data);
      if (error) console.error(error);
      setData(data || []);
    };
    const CatData = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      console.log("Categories Data:", data);
      if (error) console.error(error);
      setData(data || []);
    };
    AppData();
    PatientsData();
    CatData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        DB DETAILS , PLEASE FIND DATA IN CONSOLE
      </h1>
    </div>
  );
}
