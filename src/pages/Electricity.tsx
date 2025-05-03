
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, MoreHorizontal, Bolt, CircleDollarSign, BarChart2 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { ElectricityReading, Room } from "@/types/hostelTypes";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Electricity() {
  const [searchQuery, setSearchQuery] = useState("");
  const [readings, setReadings] = useState<ElectricityReading[]>([]);
  const [stats, setStats] = useState({
    totalUnits: 0,
    totalAmount: 0,
    avgConsumption: 0,
    currentRate: 8, // Default rate
  });
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      room_id: "",
      previous_reading: 0,
      current_reading: 0,
      rate: 8,
    },
  });
  
  // Fetch electricity readings
  useEffect(() => {
    async function fetchReadings() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("electricity_readings")
          .select(`
            id, 
            previous_reading, 
            current_reading, 
            units, 
            rate, 
            amount, 
            reading_date, 
            status, 
            created_at, 
            updated_at,
            room_id,
            rooms(room_no)
          `)
          .order('reading_date', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedData = data.map(item => ({
            ...item,
            room_no: item.rooms?.room_no || 'Unknown'
          }));
          setReadings(formattedData as unknown as ElectricityReading[]);
          
          // Calculate stats
          const totalUnits = formattedData.reduce((sum, item) => sum + (item.units || 0), 0);
          const totalAmount = formattedData.reduce((sum, item) => sum + (item.amount || 0), 0);
          const avgConsumption = totalUnits / (formattedData.length || 1);
          
          setStats({
            totalUnits,
            totalAmount,
            avgConsumption,
            currentRate: 8, // You can dynamically set this if needed
          });
        }
      } catch (error: any) {
        toast({
          title: "Error fetching electricity readings",
          description: error.message || "Failed to load electricity readings",
          variant: "destructive",
        });
        console.error("Error fetching electricity readings:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchReadings();
  }, [toast]);
  
  // Fetch rooms for the form
  useEffect(() => {
    async function fetchRooms() {
      try {
        const { data, error } = await supabase
          .from("rooms")
          .select("*")
          .order("room_no");
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setRooms(data);
        }
      } catch (error: any) {
        toast({
          title: "Error fetching rooms",
          description: error.message || "Failed to load rooms",
          variant: "destructive",
        });
        console.error("Error fetching rooms:", error);
      }
    }
    
    fetchRooms();
  }, [toast]);
  
  // Calculate units and amount when current_reading or previous_reading changes
  const calculateUnits = (current: number, previous: number, rate: number) => {
    const units = Math.max(0, current - previous);
    const amount = units * rate;
    return { units, amount };
  };
  
  // Handle form submission
  const onSubmit = async (values: any) => {
    try {
      const { units, amount } = calculateUnits(
        values.current_reading, 
        values.previous_reading,
        values.rate
      );
      
      const { data, error } = await supabase
        .from("electricity_readings")
        .insert({
          room_id: values.room_id,
          previous_reading: values.previous_reading,
          current_reading: values.current_reading,
          units,
          rate: values.rate,
          amount,
          reading_date: new Date().toISOString(),
          status: "Pending"
        })
        .select();
        
      if (error) {
        throw error;
      }
      
      // Update readings list with new entry
      if (data) {
        // Find room name
        const room = rooms.find(r => r.id === values.room_id);
        const newReading = {
          ...data[0],
          room_no: room?.room_no || 'Unknown'
        };
        
        setReadings(prev => [newReading as unknown as ElectricityReading, ...prev]);
        
        // Update stats
        setStats(prev => ({
          totalUnits: prev.totalUnits + units,
          totalAmount: prev.totalAmount + amount,
          avgConsumption: (prev.totalUnits + units) / (readings.length + 1),
          currentRate: values.rate,
        }));
        
        toast({
          title: "Reading added successfully",
          description: `New electricity reading for Room ${newReading.room_no} has been recorded.`,
        });
        
        setOpenDialog(false);
        form.reset();
      }
    } catch (error: any) {
      toast({
        title: "Error adding reading",
        description: error.message || "Failed to add electricity reading",
        variant: "destructive",
      });
      console.error("Error adding electricity reading:", error);
    }
  };
  
  // Filter readings based on search query
  const filteredReadings = readings.filter(
    (reading: any) =>
      reading.room_no?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Electricity Management</h1>
          <p className="text-muted-foreground">Track and manage electricity usage and bills.</p>
        </div>
        <Button className="flex items-center gap-1" onClick={() => setOpenDialog(true)}>
          <Plus className="h-4 w-4" />
          <span>Record New Reading</span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Units"
          value={stats.totalUnits.toString()}
          subtitle="All readings"
          icon={<Bolt className="h-5 w-5" />}
        />
        <StatCard
          title="Total Amount"
          value={`₹${stats.totalAmount.toFixed(2)}`}
          subtitle="All readings"
          icon={<CircleDollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Average Consumption"
          value={stats.avgConsumption.toFixed(1)}
          subtitle="Units per room"
          icon={<BarChart2 className="h-5 w-5" />}
        />
        <StatCard
          title="Current Rate"
          value={`₹${stats.currentRate.toFixed(2)}`}
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
                placeholder="Search by room..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Electricity Meter Readings</CardTitle>
              <p className="text-sm text-muted-foreground">Monthly electricity consumption for all rooms.</p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-4">Loading electricity readings...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room</TableHead>
                      <TableHead>Previous</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReadings.length > 0 ? (
                      filteredReadings.map((reading: any) => (
                        <TableRow key={reading.id}>
                          <TableCell className="font-medium">{reading.room_no}</TableCell>
                          <TableCell>{reading.previous_reading}</TableCell>
                          <TableCell>{reading.current_reading}</TableCell>
                          <TableCell>{reading.units}</TableCell>
                          <TableCell>₹{reading.rate}</TableCell>
                          <TableCell>₹{reading.amount}</TableCell>
                          <TableCell>{new Date(reading.reading_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <StatusBadge status={reading.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4">
                          {searchQuery ? "No readings matching your search" : "No readings found. Add some readings to get started."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
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

      {/* Add Electricity Reading Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Electricity Reading</DialogTitle>
            <DialogDescription>
              Fill in the details below to record a new electricity meter reading.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="room_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            Room {room.room_no} ({room.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="previous_reading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous Reading</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Previous meter reading"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value || '0', 10))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="current_reading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Reading</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Current meter reading"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value || '0', 10))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate (₹ per unit)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Rate per unit"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value || '0'))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch('current_reading') > 0 && form.watch('previous_reading') > 0 && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-md">
                  <div>
                    <p className="text-sm text-muted-foreground">Units</p>
                    <p className="font-semibold">
                      {Math.max(0, form.watch('current_reading') - form.watch('previous_reading'))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold">
                      ₹{(Math.max(0, form.watch('current_reading') - form.watch('previous_reading')) * form.watch('rate')).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setOpenDialog(false)} 
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit">Add Reading</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
