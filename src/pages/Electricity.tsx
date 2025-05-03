
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, MoreHorizontal, Bolt, CircleDollarSign, BarChart2 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

export default function Electricity() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data for electricity readings
  const readings = [
    { id: 1, room: "101", resident: "Rahul Sharma", previous: 1240, current: 1320, units: 80, rate: "₹8", amount: "₹640", status: "Billed" },
    { id: 2, room: "102", resident: "Priya Patel", previous: 890, current: 950, units: 60, rate: "₹8", amount: "₹480", status: "Billed" },
    { id: 3, room: "103", resident: "Vikram Singh", previous: 2100, current: 2210, units: 110, rate: "₹8", amount: "₹880", status: "Billed" },
  ];
  
  // Filter readings based on search query
  const filteredReadings = readings.filter(
    (reading) =>
      reading.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reading.resident.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Electricity Management</h1>
          <p className="text-muted-foreground">Track and manage electricity usage and bills.</p>
        </div>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>Record New Readings</span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Units (May)"
          value="520"
          subtitle="+8% from last month"
          icon={<Bolt className="h-5 w-5" />}
        />
        <StatCard
          title="Total Amount (May)"
          value="₹4,160"
          subtitle="+8% from last month"
          icon={<CircleDollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Average Consumption"
          value="86.7"
          subtitle="Units per room"
          icon={<BarChart2 className="h-5 w-5" />}
        />
        <StatCard
          title="Current Rate"
          value="₹8.00"
          subtitle="Per unit"
          icon={<CircleDollarSign className="h-5 w-5" />}
        />
      </div>

      <Tabs defaultValue="meter-readings">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="meter-readings">Meter Readings</TabsTrigger>
          <TabsTrigger value="usage-analysis">Usage Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="meter-readings" className="mt-4">
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by room or resident..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Electricity Meter Readings (May 2023)</CardTitle>
              <p className="text-sm text-muted-foreground">Monthly electricity consumption for all rooms.</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Resident</TableHead>
                    <TableHead>Previous</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReadings.map((reading) => (
                    <TableRow key={reading.id}>
                      <TableCell className="font-medium">{reading.room}</TableCell>
                      <TableCell>{reading.resident}</TableCell>
                      <TableCell>{reading.previous}</TableCell>
                      <TableCell>{reading.current}</TableCell>
                      <TableCell>{reading.units}</TableCell>
                      <TableCell>{reading.rate}</TableCell>
                      <TableCell>{reading.amount}</TableCell>
                      <TableCell>
                        <StatusBadge status={reading.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="usage-analysis">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">Analysis of electricity consumption patterns.</p>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Electricity usage charts and analytics will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
