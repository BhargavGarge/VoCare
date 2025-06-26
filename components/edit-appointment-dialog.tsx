"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import * as RadixDialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Clock,
  Trash2,
  Edit3,
  User,
  MapPin,
  FileText,
  Tag,
  Sparkles,
  Save,
  X,
} from "lucide-react";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  const selectedCategory = categories.find(
    (cat) => cat.id === formData.category
  );
  const selectedPatient = patients.find((pat) => pat.id === formData.patient);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <RadixDialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          onPointerDownOutside={(e) => {
            if (dropdownOpen) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (dropdownOpen) e.preventDefault();
          }}
        >
          {/* Background with glassmorphism effect */}
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-pink-50/80" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-400/20 to-orange-400/20 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-r from-indigo-400/15 to-cyan-400/15 rounded-full blur-xl" />

            {/* Header */}
            <div className="relative p-8 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Edit3 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      Edit Appointment
                    </h2>
                    <p className="text-sm text-gray-600">
                      Update your appointment details
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="w-10 h-10 rounded-full hover:bg-gray-100/80 transition-colors"
                >
                  <X className="w-4 h-5" />
                </Button>
              </div>
            </div>

            {/* Form Content */}
            <div className="relative px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title Field */}
                <div className="space-y-3">
                  <Label
                    htmlFor="title"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    Appointment Title *
                  </Label>
                  <div className="relative">
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Enter appointment title"
                      className="h-10 bg-white/80 backdrop-blur-sm border-gray-200/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Category and Patient Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-500" />
                      Category
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                      onOpenChange={setDropdownOpen}
                    >
                      <SelectTrigger
                        type="button"
                        className="h-10 bg-white/80 backdrop-blur-sm border-gray-200/50 focus:border-green-400 focus:ring-green-400/20 rounded-xl transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 w-full">
                          {selectedCategory ? (
                            <>
                              <span
                                className="w-4 h-4 rounded-full shadow-sm"
                                style={{
                                  backgroundColor: selectedCategory.color,
                                }}
                              />
                              <span className="font-medium">
                                {selectedCategory.label}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-500">
                              Select category
                            </span>
                          )}
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200/50 rounded-xl shadow-xl">
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                            className="rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full shadow-sm"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="font-medium">
                                {category.label}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Patient */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-500" />
                      Patient
                    </Label>
                    <Select
                      value={formData.patient}
                      onValueChange={(value) =>
                        setFormData({ ...formData, patient: value })
                      }
                      onOpenChange={setDropdownOpen}
                    >
                      <SelectTrigger
                        type="button"
                        className="h-10 bg-white/80 backdrop-blur-sm border-gray-200/50 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl transition-all duration-200"
                      >
                        <div className="flex items-center w-full">
                          {selectedPatient ? (
                            <span className="font-medium">
                              {selectedPatient.firstname}{" "}
                              {selectedPatient.lastname}
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              Select patient
                            </span>
                          )}
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200/50 rounded-xl shadow-xl">
                        {patients.map((patient) => (
                          <SelectItem
                            key={patient.id}
                            value={patient.id}
                            className="rounded-lg"
                          >
                            <span className="font-medium">
                              {patient.firstname} {patient.lastname}
                            </span>
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
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal hover:bg-gray-50 h-10"
                        type="button"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? (
                          format(formData.date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => setFormData({ ...formData, date })}
                        initialFocus
                        className="rounded-md border"
                        classNames={{
                          day_selected:
                            "bg-blue-500 text-white hover:bg-blue-600",
                          day_today: "border border-blue-300",
                          head_cell: "text-gray-500 font-medium text-xs",
                          cell: "rounded-md",
                          day: "hover:bg-gray-100 rounded-md h-9 w-9 p-0 font-normal",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Fields */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="startTime"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4 text-red-500" />
                      Start Time *
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-4 text-red-400" />
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startTime: e.target.value,
                          })
                        }
                        className="h-10 pl-12 bg-white/80 backdrop-blur-sm border-gray-200/50 focus:border-red-400 focus:ring-red-400/20 rounded-xl transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="endTime"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4 text-red-500" />
                      End Time
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-4 text-red-400" />
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData({ ...formData, endTime: e.target.value })
                        }
                        className="h-10 pl-12 bg-white/80 backdrop-blur-sm border-gray-200/50 focus:border-red-400 focus:ring-red-400/20 rounded-xl transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-3">
                  <Label
                    htmlFor="location"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-yellow-400" />
                    Location
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-4 text-yellow-400" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Enter location"
                      className="h-10 pl-12 bg-white/80 backdrop-blur-sm border-gray-200/50 focus:border-yellow-400 focus:ring-yellow-400/20 rounded-xl transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-3">
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
                    rows={4}
                    className="bg-white/80 backdrop-blur-sm border-gray-200/50 focus:border-gray-400 focus:ring-gray-400/20 rounded-xl transition-all duration-200 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200/50">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={loading}
                    className="h-10 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl shadow-lg transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-5 mr-2" />
                    Delete
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-10 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <Sparkles className="w-4 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </Dialog>
  );
}
