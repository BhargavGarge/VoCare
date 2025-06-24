"use client";

import { useState, useCallback } from "react";
import { CalendarView } from "@/components/calendar-view";
import { AppointmentList } from "@/components/appointment-list";
import { AppointmentFilters } from "@/components/appointment-filters";
import { CreateAppointmentDialog } from "@/components/create-appointment-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Calendar, List, Plus, Users, Activity, Clock } from "lucide-react";
import { useStats } from "@/hooks/use-stats";

export default function HomePage() {
  const [activeView, setActiveView] = useState<"month" | "week" | "list">(
    "month"
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState({
    category: "",
    patient: "",
    dateRange: { from: undefined, to: undefined },
  });
  const { stats } = useStats();

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Vocare Calendar
                  </h1>
                  <p className="text-sm text-gray-600">
                    Healthcare Appointment Management
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Today's Appointments
                </p>
                <p className="text-2xl font-bold">{stats.todayCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Active Patients
                </p>
                <p className="text-2xl font-bold">{stats.activePatients}</p>
              </div>
              <Users className="w-8 h-8 text-green-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">This Week</p>
                <p className="text-2xl font-bold">{stats.weekCount}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-200" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <AppointmentFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Calendar Views */}
        <Card className="shadow-lg border-0">
          <Tabs
            value={activeView}
            onValueChange={(value) => setActiveView(value as any)}
            className="w-full"
          >
            <div className="border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <TabsList className="grid w-full grid-cols-3 max-w-md ml-6 mt-4 mb-4 bg-white shadow-sm">
                <TabsTrigger
                  value="month"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <Calendar className="w-4 h-4" />
                  Month
                </TabsTrigger>
                <TabsTrigger
                  value="week"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <Calendar className="w-4 h-4" />
                  Week
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <List className="w-4 h-4" />
                  List
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="month" className="mt-0">
                <CalendarView
                  key={`month-${refreshKey}`}
                  view="month"
                  filters={filters}
                  onRefresh={handleRefresh}
                />
              </TabsContent>

              <TabsContent value="week" className="mt-0">
                <CalendarView
                  key={`week-${refreshKey}`}
                  view="week"
                  filters={filters}
                  onRefresh={handleRefresh}
                />
              </TabsContent>

              <TabsContent value="list" className="mt-0">
                <AppointmentList
                  key={`list-${refreshKey}`}
                  filters={filters}
                  onRefresh={handleRefresh}
                />
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Create Appointment Dialog */}
        <CreateAppointmentDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onAppointmentCreated={handleRefresh}
        />
      </div>
    </div>
  );
}
