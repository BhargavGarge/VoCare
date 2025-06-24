"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Clock, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useCategories } from "@/hooks/use-categories";
import { usePatients } from "@/hooks/use-patients";
import { updateAppointment, deleteAppointment } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface EditAppointmentDialogProps {
  appointment: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentUpdated?: () => void;
}

export function EditAppointmentDialog({
  appointment,
  open,
  onOpenChange,
  onAppointmentUpdated,
}: EditAppointmentDialogProps) {
  const { categories } = useCategories();
  const { patients } = usePatients();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    patient: "",
    date: undefined as Date | undefined,
    startTime: "",
    endTime: "",
    location: "",
    notes: "",
  });
  useEffect(() => {
    if (appointment && open) {
      const startDate = appointment.start
        ? parseISO(appointment.start)
        : undefined;
      const endDate = appointment.end ? parseISO(appointment.end) : undefined;

      setFormData({
        title: appointment.title || "",
        category: appointment.category?.id || appointment.category || "",
        patient: appointment.patient?.id || appointment.patient || "",
        date: startDate,
        startTime: startDate ? format(startDate, "HH:mm") : "",
        endTime: endDate ? format(endDate, "HH:mm") : "",
        location: appointment.location || "",
        notes: appointment.notes || "",
      });
    }
  }, [appointment, open]);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.startTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const startDateTime = new Date(formData.date);
      const [startHour, startMinute] = formData.startTime.split(":");
      startDateTime.setHours(
        Number.parseInt(startHour),
        Number.parseInt(startMinute)
      );

      let endDateTime = null;
      if (formData.endTime) {
        endDateTime = new Date(formData.date);
        const [endHour, endMinute] = formData.endTime.split(":");
        endDateTime.setHours(
          Number.parseInt(endHour),
          Number.parseInt(endMinute)
        );
      }

      await updateAppointment(appointment.id, {
        title: formData.title,
        category: formData.category === "none" ? null : formData.category,
        patient: formData.patient === "none" ? null : formData.patient,
        start: startDateTime.toISOString(),
        end: endDateTime?.toISOString() || null,
        location: formData.location || null,
        notes: formData.notes || null,
      });

      toast({
        title: "Success",
        description: "Appointment updated successfully.",
      });

      onOpenChange(false);
      onAppointmentUpdated?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this appointment?")) {
      return;
    }

    setLoading(true);
    try {
      await deleteAppointment(appointment.id);
      toast({
        title: "Success",
        description: "Appointment deleted successfully.",
      });
      onOpenChange(false);
      onAppointmentUpdated?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete appointment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get display names for selected values
  const selectedCategory = categories.find(
    (cat) => cat.id === formData.category
  );
  const selectedPatient = patients.find((pat) => pat.id === formData.patient);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter appointment title"
              required
            />
          </div>

          {/* Category */}
          <div>
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger className="border-gray-200 focus:border-blue-500">
                <SelectValue
                  placeholder={
                    formData.category
                      ? categories.find((c) => c.id === formData.category)
                          ?.label || "Select category"
                      : "Select category"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Patient */}
          <div>
            <Label>Patient</Label>
            <Select
              value={formData.patient}
              onValueChange={(value) =>
                setFormData({ ...formData, patient: value })
              }
            >
              <SelectTrigger className="border-gray-200 focus:border-blue-500">
                <SelectValue
                  placeholder={
                    formData.patient
                      ? `${
                          patients.find((p) => p.id === formData.patient)
                            ?.firstname ?? ""
                        } ${
                          patients.find((p) => p.id === formData.patient)
                            ?.lastname ?? ""
                        }`.trim()
                      : "Select patient"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.firstname} {patient.lastname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div>
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date
                    ? format(formData.date, "MM/dd/yyyy")
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => setFormData({ ...formData, date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Enter location"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
