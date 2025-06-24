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
import { Clock, MapPin, User, FileText, Calendar } from "lucide-react";
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
          <HoverCardContent className="w-80 p-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                  {appointment.categories && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categoryColor }}
                    />
                  )}
                  {appointment.title || "Untitled Appointment"}
                </h4>
                {appointment.categories && (
                  <Badge
                    variant="secondary"
                    className="mt-2"
                    style={{
                      backgroundColor: `${categoryColor}20`,
                      color: categoryColor,
                    }}
                  >
                    {appointment.categories.label}
                  </Badge>
                )}
              </div>

              {appointment.start && (
                <div className="flex items-center gap-3 text-sm text-gray-600 p-2 bg-blue-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>
                    {formatDateTime(appointment.start)}
                    {appointment.end && ` - ${formatTime(appointment.end)}`}
                  </span>
                </div>
              )}

              {appointment.patients && (
                <div className="flex items-center gap-3 text-sm text-gray-600 p-2 bg-green-50 rounded-lg">
                  <User className="w-4 h-4 text-green-500" />
                  <span>
                    {appointment.patients.firstname}{" "}
                    {appointment.patients.lastname}
                  </span>
                </div>
              )}

              {appointment.location && (
                <div className="flex items-center gap-3 text-sm text-gray-600 p-2 bg-orange-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span>{appointment.location}</span>
                </div>
              )}

              {appointment.notes && (
                <div className="flex items-start gap-3 text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                  <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                  <span className="line-clamp-3">{appointment.notes}</span>
                </div>
              )}
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
