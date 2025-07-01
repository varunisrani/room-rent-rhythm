
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Room } from "@/types/hostelTypes";
import { useToast } from "@/components/ui/use-toast";
import { useManagerFilter } from "@/hooks/useManagerFilter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Rooms() {
  const [searchQuery, setSearchQuery] = useState("");
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const { toast } = useToast();
  const { filterRooms, isManager } = useManagerFilter();
  
  const form = useForm({
    defaultValues: {
      room_no: "",
      type: "One sharing",
      capacity: 1,
      pg_names: "none",
    },
  });
  
  // Fetch accommodations
  useEffect(() => {
    async function fetchAccommodations() {
      try {
        const { data, error } = await supabase
          .from("accommodations")
          .select("id, name")
          .order("name");

        if (error) throw error;
        setAccommodations(data || []);
      } catch (error) {
        console.error("Error fetching accommodations:", error);
        toast({
          title: "Error",
          description: "Failed to load accommodations",
          variant: "destructive",
        });
      }
    }

    fetchAccommodations();
  }, [toast]);

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
          setAllRooms(data);
          const filteredData = filterRooms(data);
          setRooms(filteredData);
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

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (openDialog) {
      if (editMode && currentRoom) {
        form.reset({
          room_no: currentRoom.room_no,
          type: currentRoom.type,
          capacity: currentRoom.capacity,
          pg_names: currentRoom.pg_names || "none",
        });
      } else {
        form.reset({
          room_no: "",
          type: "One sharing",
          capacity: 1,
          pg_names: "none",
        });
      }
    }
  }, [openDialog, editMode, currentRoom, form]);
  
  // Filter rooms based on search query
  const filteredRooms = rooms.filter(
    (room) =>
      room.room_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.status.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleEdit = (room: Room) => {
    setCurrentRoom(room);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = (room: Room) => {
    setRoomToDelete(room);
    setConfirmDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!roomToDelete) return;
    
    try {
      const { error } = await supabase
        .from("rooms")
        .delete()
        .eq("id", roomToDelete.id);
      
      if (error) throw error;
      
      const updatedAllRooms = allRooms.filter(r => r.id !== roomToDelete.id);
      setAllRooms(updatedAllRooms);
      const filteredData = filterRooms(updatedAllRooms);
      setRooms(filteredData);
      
      toast({
        title: "Room deleted",
        description: `Room ${roomToDelete.room_no} has been removed.`
      });
    } catch (error: any) {
      toast({
        title: "Error deleting room",
        description: error.message || "Failed to delete room",
        variant: "destructive"
      });
      console.error("Error deleting room:", error);
    } finally {
      setConfirmDeleteDialog(false);
      setRoomToDelete(null);
    }
  };

  const onSubmit = async (values: any) => {
    try {
      if (editMode && currentRoom) {
        // Update existing room
        const { data, error } = await supabase
          .from("rooms")
          .update({
            room_no: values.room_no,
            type: values.type,
            capacity: values.capacity,
            pg_names: values.pg_names === "none" ? null : values.pg_names
          })
          .eq("id", currentRoom.id)
          .select();
        
        if (error) throw error;
        
        if (data) {
          const updatedAllRooms = allRooms.map(room => 
            room.id === currentRoom.id ? data[0] : room
          );
          setAllRooms(updatedAllRooms);
          const filteredData = filterRooms(updatedAllRooms);
          setRooms(filteredData);
          
          toast({
            title: "Room updated successfully",
            description: `Room ${values.room_no} has been updated.`,
          });
        }
      } else {
        // Add new room
        const { data, error } = await supabase
          .from("rooms")
          .insert([
            {
              room_no: values.room_no,
              type: values.type,
              capacity: values.capacity,
              occupancy: 0,
              rent: 0,
              floor: "1",
              status: "Available",
              pg_names: values.pg_names === "none" ? null : values.pg_names
            }
          ])
          .select();
          
        if (error) throw error;
        
        if (data) {
          const updatedAllRooms = [...allRooms, data[0]];
          setAllRooms(updatedAllRooms);
          const filteredData = filterRooms(updatedAllRooms);
          setRooms(filteredData);
          
          toast({
            title: "Room added successfully",
            description: `Room ${values.room_no} has been added.`,
          });
        }
      }
      
      setOpenDialog(false);
      setEditMode(false);
      setCurrentRoom(null);
      form.reset();
    } catch (error: any) {
      toast({
        title: `Error ${editMode ? 'updating' : 'adding'} room`,
        description: error.message || `Failed to ${editMode ? 'update' : 'add'} room`,
        variant: "destructive",
      });
      console.error(`Error ${editMode ? 'updating' : 'adding'} room:`, error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Rooms</h1>
          <p className="text-muted-foreground">Manage all your hostel rooms and their status.</p>
        </div>
        <Button className="flex items-center gap-1" onClick={() => {
          setEditMode(false);
          setCurrentRoom(null);
          setOpenDialog(true);
        }}>
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
                  <TableHead>Capacity</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>PG Name</TableHead>
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
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>{room.occupancy}</TableCell>
                      <TableCell>{room.pg_names || "No PG Selected"}</TableCell>
                      <TableCell>
                        <StatusBadge status={room.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(room)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(room)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
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
            <DialogTitle>{editMode ? "Edit Room" : "Add New Room"}</DialogTitle>
            <DialogDescription>
              {editMode 
                ? "Update the room details below." 
                : "Fill in the details below to add a new room to your hostel."
              }
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
                          <SelectItem value="One sharing">One sharing</SelectItem>
                          <SelectItem value="Two sharing">Two sharing</SelectItem>
                          <SelectItem value="Three sharing">Three sharing</SelectItem>
                          <SelectItem value="Four sharing">Four sharing</SelectItem>
                          <SelectItem value="Five sharing">Five sharing</SelectItem>
                          <SelectItem value="Six sharing">Six sharing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
              </div>

              <FormField
                control={form.control}
                name="pg_names"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PG Name</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select PG" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No PG Selected</SelectItem>
                        {accommodations.map((accommodation) => (
                          <SelectItem key={accommodation.id} value={accommodation.name}>
                            {accommodation.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setOpenDialog(false)} 
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit">{editMode ? "Update Room" : "Add Room"}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteDialog} onOpenChange={setConfirmDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Room {roomToDelete?.room_no}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
