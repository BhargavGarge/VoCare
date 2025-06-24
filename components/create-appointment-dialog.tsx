"use client";

import type React from "react";

import { useState } from "react";
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
import { CalendarIcon, Clock, MapPin, FileText, User, Tag } from "lucide-react";
import { format } from "date-fns";
import { useCategories } from "@/hooks/use-categories";
import { usePatients } from "@/hooks/use-patients";
import { createAppointment } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentCreated?: () => void;
}

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  onAppointmentCreated,
}: CreateAppointmentDialogProps) {
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
    label: "",
  });
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

      await createAppointment({
        title: formData.title,
        category: formData.category || null,
        patient: formData.patient || null,
        start: startDateTime.toISOString(),
        end: endDateTime?.toISOString() || null,
        location: formData.location || null,
        notes: formData.notes || null,
      });

      toast({
        title: "Success",
        description: "Appointment created successfully.",
      });

      // Reset form
      setFormData({
        title: "",
        category: "",
        patient: "",
        date: undefined,
        startTime: "",
        endTime: "",
        location: "",
        notes: "",
        label: "",
      });

      onOpenChange(false);
      onAppointmentCreated?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create appointment.",
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-white" />
            </div>
            Create New Appointment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-blue-500" />
              Appointment Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter appointment title"
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Category and Patient Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-500" />
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2 w-full">
                    {selectedCategory ? (
                      <>
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: selectedCategory.color }}
                        />
                        <span>{selectedCategory.label}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        Select category
                      </span>
                    )}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-500" />
                Patient
              </Label>
              <Select
                value={formData.patient}
                onValueChange={(value) =>
                  setFormData({ ...formData, patient: value })
                }
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center w-full">
                    {selectedPatient ? (
                      <span>
                        {selectedPatient.firstname} {selectedPatient.lastname}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Select patient
                      </span>
                    )}
                  </div>
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
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-orange-500" />
              Date *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-gray-200 focus:border-blue-500"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                  {formData.date
                    ? format(formData.date, "EEEE, MMMM dd, yyyy")
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
            <div className="space-y-2">
              <Label
                htmlFor="startTime"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-red-500" />
                Start Time *
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className="border-gray-200 focus:border-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="endTime"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-red-500" />
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className="border-gray-200 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label
              htmlFor="location"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-yellow-500" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Enter location"
              className="border-gray-200 focus:border-blue-500"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label
              htmlFor="notes"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-gray-500" />
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes..."
              rows={3}
              className="border-gray-200 focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {loading ? "Creating..." : "Create Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
