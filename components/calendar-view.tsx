"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppointmentCard } from "@/components/appointment-card";
import { useAppointments } from "@/hooks/use-appointments";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  addWeeks,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";

interface CalendarViewProps {
  view: "month" | "week";
  filters: {
    category: string;
    patient: string;
    dateRange: { from?: Date; to?: Date };
  };
  onRefresh?: () => void;
}

export function CalendarView({ view, filters, onRefresh }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { appointments, loading } = useAppointments(filters);

  const navigateDate = (direction: "prev" | "next") => {
    if (view === "month") {
      setCurrentDate((prev) => addMonths(prev, direction === "next" ? 1 : -1));
    } else {
      setCurrentDate((prev) => addWeeks(prev, direction === "next" ? 1 : -1));
    }
  };

  const getDateRange = () => {
    if (view === "month") {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      return { start, end };
    } else {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return { start, end };
    }
  };

  const { start, end } = getDateRange();
  const days = [];
  let day = start;

  while (day <= end) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((appointment) => {
      if (!appointment.start) return false;
      const appointmentDate = parseISO(appointment.start);
      return isSameDay(appointmentDate, date);
    });
  };

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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(
            currentDate,
            view === "month" ? "MMMM yyyy" : "'Week of' MMMM dd, yyyy"
          )}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate("prev")}
            className="hover:bg-blue-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="hover:bg-blue-50"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate("next")}
            className="hover:bg-blue-50"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 bg-white rounded-lg overflow-hidden shadow-sm border">
        {/* Weekday Headers */}
        {[
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].map((day) => (
          <div
            key={day}
            className="p-4 text-center text-sm font-semibold text-gray-700 bg-gray-50 border-b"
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((day) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isCurrentMonth =
            view === "month" ? isSameMonth(day, currentDate) : true;
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`min-h-32 p-2 border-b border-r border-gray-100 ${
                !isCurrentMonth
                  ? "bg-gray-50 text-gray-400"
                  : "bg-white hover:bg-blue-50/30"
              } ${
                isToday ? "bg-blue-50 border-blue-200" : ""
              } transition-colors`}
            >
              <div
                className={`text-sm font-semibold mb-2 ${
                  isToday ? "text-blue-600" : "text-gray-900"
                }`}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayAppointments
                  .slice(0, view === "month" ? 3 : 6)
                  .map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      compact={view === "month"}
                      onUpdate={onRefresh}
                    />
                  ))}
                {dayAppointments.length > (view === "month" ? 3 : 6) && (
                  <div className="text-xs text-blue-600 px-2 py-1 bg-blue-50 rounded font-medium">
                    +{dayAppointments.length - (view === "month" ? 3 : 6)} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
