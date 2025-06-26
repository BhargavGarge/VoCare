"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
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
  getHours,
  getMinutes,
  differenceInMinutes,
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
  const [manualTimeScale, setManualTimeScale] = useState<boolean | null>(null);
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

  // Smart time scale detection
  const shouldShowTimeScale = useMemo(() => {
    // If user manually toggled, respect their choice
    if (manualTimeScale !== null) {
      return manualTimeScale;
    }

    // Only consider time scale for week view
    if (view !== "week") {
      return false;
    }

    // Get all appointments in the current view
    const viewAppointments = appointments.filter((appointment) => {
      if (!appointment.start) return false;
      const appointmentDate = parseISO(appointment.start);
      return appointmentDate >= start && appointmentDate <= end;
    });

    // No appointments = no time scale needed
    if (viewAppointments.length === 0) {
      return false;
    }

    // Check for conditions that benefit from time scale:

    // 1. Multiple appointments on the same day
    const appointmentsByDay = viewAppointments.reduce((acc, appointment) => {
      const date = format(parseISO(appointment.start), "yyyy-MM-dd");
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const hasMultipleAppointmentsPerDay = Object.values(appointmentsByDay).some(
      (count) => count > 1
    );

    // 2. Appointments with specific durations (not just default 1-hour slots)
    const hasSpecificDurations = viewAppointments.some((appointment) => {
      if (!appointment.start || !appointment.end) return false;
      const duration = differenceInMinutes(
        parseISO(appointment.end),
        parseISO(appointment.start)
      );
      return duration !== 60; // Not exactly 1 hour
    });

    // 3. Appointments at unusual times (not on the hour)
    const hasOffHourTimes = viewAppointments.some((appointment) => {
      if (!appointment.start) return false;
      const minutes = getMinutes(parseISO(appointment.start));
      return minutes !== 0; // Not exactly on the hour
    });

    // 4. High density of appointments (more than 3 total in week view)
    const hasHighDensity = viewAppointments.length > 3;

    // 5. Appointments spanning business hours (early morning or late evening)
    const hasExtendedHours = viewAppointments.some((appointment) => {
      if (!appointment.start) return false;
      const hour = getHours(parseISO(appointment.start));
      return hour < 8 || hour > 18; // Before 8 AM or after 6 PM
    });

    return (
      hasMultipleAppointmentsPerDay ||
      hasSpecificDurations ||
      hasOffHourTimes ||
      hasHighDensity ||
      hasExtendedHours
    );
  }, [appointments, start, end, view, manualTimeScale]);

  const getAppointmentPosition = (appointment: any) => {
    if (!appointment.start) return { top: 0, height: 60 };

    const startTime = parseISO(appointment.start);
    const startHour = getHours(startTime);
    const startMinute = getMinutes(startTime);

    // Calculate position (each hour = 60px, each minute = 1px)
    const top = startHour * 60 + startMinute;

    let height = 60; // Default 1 hour
    if (appointment.end) {
      const endTime = parseISO(appointment.end);
      const endHour = getHours(endTime);
      const endMinute = getMinutes(endTime);
      const endPosition = endHour * 60 + endMinute;
      height = Math.max(30, endPosition - top); // Minimum 30px height
    }

    return { top, height };
  };

  // Generate time slots (6 AM to 10 PM)
  const timeSlots = [];
  for (let hour = 6; hour <= 22; hour++) {
    timeSlots.push(hour);
  }

  // Get time scale reason for display
  const getTimeScaleReason = () => {
    if (manualTimeScale !== null) return "Manual override";

    const viewAppointments = appointments.filter((appointment) => {
      if (!appointment.start) return false;
      const appointmentDate = parseISO(appointment.start);
      return appointmentDate >= start && appointmentDate <= end;
    });

    if (viewAppointments.length === 0) return "No appointments";

    const appointmentsByDay = viewAppointments.reduce((acc, appointment) => {
      const date = format(parseISO(appointment.start), "yyyy-MM-dd");
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (Object.values(appointmentsByDay).some((count) => count > 1)) {
      return "Multiple appointments per day detected";
    }

    if (
      viewAppointments.some((appointment) => {
        if (!appointment.start || !appointment.end) return false;
        const duration = differenceInMinutes(
          parseISO(appointment.end),
          parseISO(appointment.start)
        );
        return duration !== 60;
      })
    ) {
      return "Custom appointment durations detected";
    }

    if (
      viewAppointments.some((appointment) => {
        if (!appointment.start) return false;
        const minutes = getMinutes(parseISO(appointment.start));
        return minutes !== 0;
      })
    ) {
      return "Off-hour appointment times detected";
    }

    if (viewAppointments.length > 3) {
      return "High appointment density detected";
    }

    if (
      viewAppointments.some((appointment) => {
        if (!appointment.start) return false;
        const hour = getHours(parseISO(appointment.start));
        return hour < 8 || hour > 18;
      })
    ) {
      return "Extended hours appointments detected";
    }

    return "Standard view";
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
          {view === "week" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setManualTimeScale(!shouldShowTimeScale)}
              className={`hover:bg-blue-50 ${
                shouldShowTimeScale ? "bg-blue-100 text-blue-700" : ""
              }`}
              title={`Time scale is ${
                shouldShowTimeScale ? "ON" : "OFF"
              } - ${getTimeScaleReason()}`}
            >
              <Clock className="w-4 h-4 mr-2" />
              {shouldShowTimeScale ? "Hide" : "Show"} Time Scale
            </Button>
          )}
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

      {/* Smart Time Scale Indicator */}
      {shouldShowTimeScale && view === "week" && manualTimeScale === null && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Smart Time Scale Active
            </span>
            <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
              {getTimeScaleReason()}
            </span>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      {shouldShowTimeScale && view === "week" ? (
        // Week view with time scale
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border">
          {/* Header with days */}
          <div className="grid grid-cols-8 border-b bg-gray-50">
            <div className="p-4 text-center text-sm font-semibold text-gray-700 border-r">
              Time
            </div>
            {days.map((day) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`p-4 text-center text-sm font-semibold border-r ${
                    isToday ? "bg-blue-100 text-blue-700" : "text-gray-700"
                  }`}
                >
                  <div className="font-bold">{format(day, "EEE")}</div>
                  <div
                    className={`text-lg ${
                      isToday ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          <div className="relative">
            <div className="grid grid-cols-8">
              {/* Time column */}
              <div className="border-r bg-gray-50/50">
                {timeSlots.map((hour) => (
                  <div
                    key={hour}
                    className="h-15 px-2 py-1 text-xs text-gray-600 border-b flex items-center justify-end"
                    style={{ height: "60px" }}
                  >
                    {format(new Date().setHours(hour, 0), "HH:mm")}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {days.map((day) => {
                const dayAppointments = getAppointmentsForDay(day);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={`relative border-r ${
                      isToday ? "bg-blue-50/30" : "hover:bg-gray-50/50"
                    }`}
                  >
                    {/* Time slots background */}
                    {timeSlots.map((hour) => (
                      <div
                        key={hour}
                        className="h-15 border-b border-gray-100"
                        style={{ height: "60px" }}
                      />
                    ))}

                    {/* Appointments positioned absolutely */}
                    <div className="absolute inset-0 p-1">
                      {dayAppointments.map((appointment) => {
                        const { top, height } =
                          getAppointmentPosition(appointment);
                        const categoryColor =
                          appointment.categories?.color || "#3b82f6";

                        return (
                          <div
                            key={appointment.id}
                            className="absolute left-1 right-1 rounded-md shadow-sm border-l-4 bg-white hover:shadow-md transition-shadow cursor-pointer z-10"
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              borderLeftColor: categoryColor,
                              minHeight: "30px",
                            }}
                            onClick={() => {
                              // Handle appointment click
                            }}
                          >
                            <div className="p-2 h-full overflow-hidden">
                              <div className="text-xs font-semibold text-gray-900 truncate">
                                {appointment.title}
                              </div>
                              {appointment.patients && (
                                <div className="text-xs text-gray-600 truncate">
                                  {appointment.patients.firstname}{" "}
                                  {appointment.patients.lastname}
                                </div>
                              )}
                              {appointment.start && (
                                <div className="text-xs text-gray-500">
                                  {format(parseISO(appointment.start), "HH:mm")}
                                  {appointment.end &&
                                    ` - ${format(
                                      parseISO(appointment.end),
                                      "HH:mm"
                                    )}`}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        // Standard grid view (month or week without time scale)
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
                      +{dayAppointments.length - (view === "month" ? 3 : 6)}{" "}
                      more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
