"use client";

import { Card } from "@/components/ui/card";
import { AppointmentCard } from "@/components/appointment-card";
import { useAppointments } from "@/hooks/use-appointments";
import { format, parseISO } from "date-fns";
import { Calendar, Clock } from "lucide-react";

interface AppointmentListProps {
  filters: {
    category: string;
    patient: string;
    dateRange: { from?: Date; to?: Date };
  };
  onRefresh?: () => void;
}

export function AppointmentList({ filters, onRefresh }: AppointmentListProps) {
  const { appointments, loading } = useAppointments(filters);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-500">Loading appointments...</div>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className="p-12 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No appointments found
        </h3>
        <p className="text-gray-600">
          Try adjusting your filters or create a new appointment.
        </p>
      </Card>
    );
  }

  // Group appointments by date
  const groupedAppointments = appointments.reduce<
    Record<string, typeof appointments>
  >((groups, appointment) => {
    if (!appointment.start) return groups;

    const date = format(parseISO(appointment.start), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groupedAppointments)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, dayAppointments]) => (
          <Card key={date} className="p-6 shadow-md border-0 bg-white">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {format(parseISO(date), "EEEE, MMMM dd, yyyy")}
                </h3>
                <p className="text-sm text-gray-600">
                  {dayAppointments.length} appointments
                </p>
              </div>
            </div>
            <div className="grid gap-4">
              {dayAppointments
                .sort((a, b) => (a.start || "").localeCompare(b.start || ""))
                .map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    compact={false}
                    showDate={false}
                    onUpdate={onRefresh}
                  />
                ))}
            </div>
          </Card>
        ))}
    </div>
  );
}
