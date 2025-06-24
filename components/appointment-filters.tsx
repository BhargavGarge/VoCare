"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X, Filter } from "lucide-react";
import { format } from "date-fns";
import { useCategories } from "@/hooks/use-categories";
import { usePatients } from "@/hooks/use-patients";

interface AppointmentFiltersProps {
  filters: {
    category: string;
    patient: string;
    dateRange: { from?: Date; to?: Date };
  };
  onFiltersChange: (filters: any) => void;
}

export function AppointmentFilters({
  filters,
  onFiltersChange,
}: AppointmentFiltersProps) {
  const { categories } = useCategories();
  const { patients } = usePatients();
  type DateRange = { from: Date | undefined; to: Date | undefined };
  const [dateRange, setDateRange] = useState<DateRange>({
    from: filters.dateRange.from ?? undefined,
    to: filters.dateRange.to ?? undefined,
  });

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    onFiltersChange({
      category: "",
      patient: "",
      dateRange: { from: undefined, to: undefined },
    });
  };

  const hasActiveFilters =
    filters.category ||
    filters.patient ||
    filters.dateRange.from ||
    filters.dateRange.to;

  // Get display names for selected values
  const selectedCategory = categories.find(
    (cat) => cat.id === filters.category
  );
  const selectedPatient = patients.find((pat) => pat.id === filters.patient);

  return (
    <Card className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-0 shadow-md">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">
            Filter Appointments:
          </span>
        </div>

        {/* Category Filter */}
        <Select
          value={filters.category}
          onValueChange={(value) => updateFilter("category", value)}
        >
          <SelectTrigger className="w-56 bg-white shadow-sm border-gray-200">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
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

        {/* Patient Filter */}
        <Select
          value={filters.patient}
          onValueChange={(value) => updateFilter("patient", value)}
        >
          <SelectTrigger className="w-56 bg-white shadow-sm border-gray-200">
            <SelectValue placeholder="All Patients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Patients</SelectItem>
            {patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.firstname} {patient.lastname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-72 justify-start text-left font-normal bg-white shadow-sm border-gray-200"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                    {format(dateRange.to, "MMM dd, yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "MMM dd, yyyy")
                )
              ) : (
                "Select date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              onSelect={(range) => {
                const safeRange = {
                  from: range?.from ?? undefined,
                  to: range?.to ?? undefined,
                };
                setDateRange(safeRange);
                updateFilter("dateRange", safeRange);
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Show active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
          <span className="text-xs font-medium text-gray-500">
            Active filters:
          </span>
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: selectedCategory.color }}
              />
              {selectedCategory.label}
            </span>
          )}
          {selectedPatient && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {selectedPatient.firstname} {selectedPatient.lastname}
            </span>
          )}
          {dateRange.from && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              {dateRange.from && dateRange.to
                ? `${format(dateRange.from, "MMM dd")} - ${format(
                    dateRange.to,
                    "MMM dd"
                  )}`
                : format(dateRange.from, "MMM dd, yyyy")}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
