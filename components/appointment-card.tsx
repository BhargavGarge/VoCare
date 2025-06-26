"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { EditAppointmentDialog } from "@/components/edit-appointment-dialog";
import {
  Clock,
  MapPin,
  User,
  FileText,
  Calendar,
  Sparkles,
  Heart,
  Star,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface AppointmentCardProps {
  appointment: any;
  compact?: boolean;
  showDate?: boolean;
  onUpdate?: () => void;
}

export function AppointmentCard({
  appointment,
  compact = false,
  showDate = true,
  onUpdate,
}: AppointmentCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "HH:mm");
    } catch {
      return "";
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  const formatDateOnly = (dateString: string) => {
    try {
      return format(parseISO(dateString), "EEEE, MMMM dd");
    } catch {
      return dateString;
    }
  };

  const categoryColor = appointment.categories?.color || "#3b82f6";

  const CardContent = (
    <Card
      className={`p-3 cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 hover:scale-[1.02] ${
        compact ? "text-xs" : "text-sm"
      }`}
      style={{ borderLeftColor: categoryColor }}
      onClick={() => setIsEditDialogOpen(true)}
    >
      <div className="space-y-1">
        <div className="font-semibold text-gray-900 truncate flex items-center gap-2">
          {appointment.categories && (
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: categoryColor }}
            />
          )}
          {appointment.title || "Untitled Appointment"}
        </div>

        {appointment.start && (
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="w-3 h-3 text-blue-500" />
            <span className="text-xs">
              {showDate
                ? formatDateTime(appointment.start)
                : formatTime(appointment.start)}
              {appointment.end && ` - ${formatTime(appointment.end)}`}
            </span>
          </div>
        )}

        {!compact && (
          <>
            {appointment.patients && (
              <div className="flex items-center gap-1 text-gray-600">
                <User className="w-3 h-3 text-green-500" />
                <span className="text-xs">
                  {appointment.patients.firstname}{" "}
                  {appointment.patients.lastname}
                </span>
              </div>
            )}

            {appointment.location && (
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="w-3 h-3 text-orange-500" />
                <span className="text-xs truncate">{appointment.location}</span>
              </div>
            )}

            {appointment.categories && (
              <Badge
                variant="secondary"
                className="text-xs mt-1"
                style={{
                  backgroundColor: `${categoryColor}20`,
                  color: categoryColor,
                }}
              >
                {appointment.categories.label}
              </Badge>
            )}
          </>
        )}
      </div>
    </Card>
  );

  if (compact) {
    return (
      <>
        <HoverCard>
          <HoverCardTrigger asChild>{CardContent}</HoverCardTrigger>
          <HoverCardContent
            className="w-96 p-0 overflow-hidden"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-60" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-200/30 to-orange-200/30 rounded-full blur-xl" />

            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm"
                  style={{
                    background: `linear-gradient(135deg, ${categoryColor}20, ${categoryColor}40)`,
                    border: `1px solid ${categoryColor}30`,
                  }}
                >
                  <Sparkles
                    className="w-7 h-7"
                    style={{ color: categoryColor }}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-xl text-gray-900 leading-tight mb-2">
                    {appointment.title || "Untitled Appointment"}
                  </h4>
                  {appointment.categories && (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-sm px-3 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: `${categoryColor}15`,
                          color: categoryColor,
                          border: `1px solid ${categoryColor}30`,
                        }}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        {appointment.categories.label}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="relative p-6 space-y-4">
              {appointment.start && (
                <div className="group">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl border border-blue-100/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {formatDateOnly(appointment.start)}
                      </div>
                      <div className="text-lg font-bold text-blue-700">
                        {formatTime(appointment.start)}
                        {appointment.end && (
                          <span className="text-sm font-normal text-gray-600 ml-2">
                            → {formatTime(appointment.end)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {appointment.patients && (
                <div className="group">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50/80 to-green-50/80 rounded-2xl border border-emerald-100/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        Patient
                      </div>
                      <div className="text-lg font-bold text-emerald-700">
                        {appointment.patients.firstname}{" "}
                        {appointment.patients.lastname}
                      </div>
                      {appointment.patients.care_level && (
                        <div className="flex items-center gap-2 mt-2">
                          <Heart className="w-4 h-4 text-pink-500" />
                          <span className="text-sm text-gray-600 font-medium">
                            Care Level {appointment.patients.care_level}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {appointment.location && (
                <div className="group">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50/80 to-orange-50/80 rounded-2xl border border-amber-100/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        Location
                      </div>
                      <div className="text-lg font-bold text-amber-700">
                        {appointment.location}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {appointment.notes && (
                <div className="group">
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50/80 to-gray-50/80 rounded-2xl border border-slate-100/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-600 mb-2">
                        Notes
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                        {appointment.notes}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="relative p-4 bg-gradient-to-r from-gray-50/90 to-white/90 backdrop-blur-sm border-t border-gray-100/50">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-200/30">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Click to edit appointment
                  </span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>

        <EditAppointmentDialog
          appointment={appointment}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onAppointmentUpdated={onUpdate}
        />
      </>
    );
  }

  return (
    <>
      {CardContent}
      <EditAppointmentDialog
        appointment={appointment}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onAppointmentUpdated={onUpdate}
      />
    </>
  );
}
