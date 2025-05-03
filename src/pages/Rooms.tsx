
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Room } from "@/types/hostelTypes";
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

export default function Rooms() {
  const [searchQuery, setSearchQuery] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      room_no: "",
      type: "Single",
      floor: "Ground",
      capacity: 1,
      rent: 0,
    },
  });
  
  useEffect(() => {
    async function fetchRooms() {
      try {
        setLoading(true);
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
          description: error.message || "An error occurred while fetching rooms",
          variant: "destructive",
        });
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRooms();
  }, [toast]);
  
  // Filter rooms based on search query
  const filteredRooms = rooms.filter(
    (room) =>
      room.room_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.status.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const onSubmit = async (values: any) => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .insert([
          {
            room_no: values.room_no,
            type: values.type,
            floor: values.floor,
            capacity: values.capacity,
            rent: values.rent,
            occupancy: 0,
            status: "Available"
          }
        ])
        .select();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setRooms([...rooms, data[0]]);
        
        toast({
          title: "Room added successfully",
          description: `Room ${values.room_no} has been added.`,
        });
        
        setOpenDialog(false);
        form.reset();
      }
    } catch (error: any) {
      toast({
        title: "Error adding room",
        description: error.message || "Failed to add room",
        variant: "destructive",
      });
      console.error("Error adding room:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Rooms</h1>
          <p className="text-muted-foreground">Manage all your hostel rooms and their status.</p>
        </div>
        <Button className="flex items-center gap-1" onClick={() => setOpenDialog(true)}>
          <Plus className="h-4 w-4" />
          <span>Add Room</span>
        </Button>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">All Rooms</CardTitle>
          <p className="text-sm text-muted-foreground">A list of all rooms in your hostel with their current status.</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Loading rooms...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room No.</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.room_no}</TableCell>
                      <TableCell>{room.type}</TableCell>
                      <TableCell>{room.floor}</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>{room.occupancy}</TableCell>
                      <TableCell>₹{room.rent}</TableCell>
                      <TableCell>
                        <StatusBadge status={room.status} />
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
                    <TableCell colSpan={8} className="text-center py-4">
                      {searchQuery ? "No rooms matching your search" : "No rooms found. Add some rooms to get started."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Add Room Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new room to your hostel.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="room_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Double">Double</SelectItem>
                          <SelectItem value="Triple">Triple</SelectItem>
                          <SelectItem value="Quad">Quad</SelectItem>
                          <SelectItem value="Dormitory">Dormitory</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select floor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Ground">Ground Floor</SelectItem>
                          <SelectItem value="First">First Floor</SelectItem>
                          <SelectItem value="Second">Second Floor</SelectItem>
                          <SelectItem value="Third">Third Floor</SelectItem>
                          <SelectItem value="Fourth">Fourth Floor</SelectItem>
                          <SelectItem value="Fifth">Fifth Floor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Number of beds"
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
                  name="rent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Rent (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Monthly rent"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value || '0'))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setOpenDialog(false)} 
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit">Add Room</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
