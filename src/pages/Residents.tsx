
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, MoreHorizontal, Edit, Trash2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Resident, Room } from "@/types/hostelTypes";
import { useToast } from "@/components/ui/use-toast";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Residents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [residents, setResidents] = useState<Resident[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentResident, setCurrentResident] = useState<Resident | null>(null);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState<Resident | null>(null);
  const [pgLocations, setPgLocations] = useState<string[]>([
    "Main Building", 
    "Annex Building", 
    "North Wing", 
    "South Wing", 
    "East Block"
  ]);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      room_id: "",
      date_of_birth: "",
      gender: "male",
      security_deposit: 0,
      pg_location: "",
      monthly_rent: 0,
      join_date: new Date().toISOString().split('T')[0],
    },
  });
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (openDialog) {
      if (editMode && currentResident) {
        form.reset({
          name: currentResident.name,
          phone: currentResident.phone,
          email: currentResident.email || "",
          room_id: currentResident.room_id || "",
          date_of_birth: currentResident.date_of_birth ? new Date(currentResident.date_of_birth).toISOString().split('T')[0] : "",
          gender: currentResident.gender || "male",
          security_deposit: currentResident.security_deposit || 0,
          pg_location: currentResident.pg_location || "",
          monthly_rent: currentResident.monthly_rent || 0,
          join_date: new Date(currentResident.join_date).toISOString().split('T')[0],
        });
      } else {
        form.reset({
          name: "",
          phone: "",
          email: "",
          room_id: "",
          date_of_birth: "",
          gender: "male",
          security_deposit: 0,
          pg_location: "",
          monthly_rent: 0,
          join_date: new Date().toISOString().split('T')[0],
        });
      }
    }
  }, [openDialog, editMode, currentResident, form]);
  
  // Fetch residents
  useEffect(() => {
    async function fetchResidents() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("residents")
          .select(`
            id,
            name,
            phone,
            email,
            join_date,
            status,
            created_at,
            updated_at,
            room_id,
            date_of_birth,
            gender,
            security_deposit,
            pg_location,
            monthly_rent,
            rooms(room_no)
          `)
          .order("name");
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedData = data.map(item => ({
            ...item,
            room: item.rooms?.room_no || 'Not Assigned'
          }));
          setResidents(formattedData as unknown as Resident[]);
          console.log("Resident data loaded:", formattedData);
        }
      } catch (error: any) {
        toast({
          title: "Error fetching residents",
          description: error.message || "Failed to load residents",
          variant: "destructive",
        });
        console.error("Error fetching residents:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchResidents();
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
          console.log("Rooms loaded:", data);
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
  
  // Filter residents based on search query
  const filteredResidents = residents.filter(
    (resident) =>
      resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resident.room && String(resident.room).includes(searchQuery)) ||
      resident.phone.includes(searchQuery)
  );
  
  const onSubmit = async (values: any) => {
    try {
      const roomIdToUse = values.room_id === "not_assigned" ? null : values.room_id;
      
      // Format date to YYYY-MM-DD format for PostgreSQL
      const formattedDateOfBirth = values.date_of_birth ? values.date_of_birth : null;
      
      if (editMode && currentResident) {
        // Update existing resident
        const { data, error } = await supabase
          .from("residents")
          .update({
            name: values.name,
            phone: values.phone,
            email: values.email || null,
            room_id: roomIdToUse,
            date_of_birth: formattedDateOfBirth,
            gender: values.gender,
            security_deposit: values.security_deposit,
            pg_location: values.pg_location,
            monthly_rent: values.monthly_rent,
            join_date: values.join_date,
          })
          .eq("id", currentResident.id)
          .select();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          // Find room name
          const room = rooms.find(r => r.id === roomIdToUse);
          const updatedResident = {
            ...data[0],
            room: room?.room_no || 'Not Assigned'
          };
          
          setResidents(residents.map(r => 
            r.id === currentResident.id ? updatedResident as unknown as Resident : r
          ));
          
          toast({
            title: "Resident updated successfully",
            description: `${values.name}'s information has been updated.`,
          });
        }
      } else {
        // Create new resident
        const { data, error } = await supabase
          .from("residents")
          .insert({
            name: values.name,
            phone: values.phone,
            email: values.email || null,
            room_id: roomIdToUse,
            status: "Active",
            join_date: values.join_date,
            date_of_birth: formattedDateOfBirth,
            gender: values.gender,
            security_deposit: values.security_deposit,
            pg_location: values.pg_location,
            monthly_rent: values.monthly_rent,
          })
          .select();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          // Find room name
          const room = rooms.find(r => r.id === roomIdToUse);
          const newResident = {
            ...data[0],
            room: room?.room_no || 'Not Assigned'
          };
          
          setResidents([...residents, newResident as unknown as Resident]);
          
          toast({
            title: "Resident added successfully",
            description: `${values.name} has been added as a new resident.`,
          });
        }
      }
      
      setOpenDialog(false);
      form.reset();
      setEditMode(false);
      setCurrentResident(null);
    } catch (error: any) {
      toast({
        title: editMode ? "Error updating resident" : "Error adding resident",
        description: error.message || `Failed to ${editMode ? 'update' : 'add'} resident`,
        variant: "destructive",
      });
      console.error(`Error ${editMode ? 'updating' : 'adding'} resident:`, error);
    }
  };

  const handleEdit = (resident: Resident) => {
    setCurrentResident(resident);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = (resident: Resident) => {
    setResidentToDelete(resident);
    setConfirmDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!residentToDelete) return;
    
    try {
      const { error } = await supabase
        .from("residents")
        .delete()
        .eq("id", residentToDelete.id);
      
      if (error) throw error;
      
      setResidents(residents.filter(r => r.id !== residentToDelete.id));
      
      toast({
        title: "Resident deleted",
        description: `${residentToDelete.name} has been removed.`
      });
    } catch (error: any) {
      toast({
        title: "Error deleting resident",
        description: error.message || "Failed to delete resident",
        variant: "destructive"
      });
      console.error("Error deleting resident:", error);
    } finally {
      setConfirmDeleteDialog(false);
      setResidentToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Residents</h1>
          <p className="text-muted-foreground">Manage all your hostel residents in one place.</p>
        </div>
        <Button className="flex items-center gap-1" onClick={() => {
          setEditMode(false);
          setCurrentResident(null);
          setOpenDialog(true);
        }}>
          <Plus className="h-4 w-4" />
          <span>Add Resident</span>
        </Button>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search residents..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">All Residents</CardTitle>
          <p className="text-sm text-muted-foreground">A list of all residents currently staying in your hostel.</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Loading residents...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResidents.length > 0 ? (
                  filteredResidents.map((resident: any) => (
                    <TableRow key={resident.id}>
                      <TableCell className="font-medium">{resident.name}</TableCell>
                      <TableCell>{resident.room}</TableCell>
                      <TableCell>{resident.phone}</TableCell>
                      <TableCell>{new Date(resident.join_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <StatusBadge status={resident.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(resident)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={() => handleDelete(resident)}
                            >
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
                    <TableCell colSpan={6} className="text-center py-4">
                      {searchQuery ? "No residents matching your search" : "No residents found. Add some residents to get started."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Add/Edit Resident Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Resident" : "Add New Resident"}</DialogTitle>
            <DialogDescription>
              {editMode 
                ? "Update the resident's information below."
                : "Fill in the details below to add a new resident to your hostel."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 flex items-center justify-center p-4 bg-muted/50 rounded-lg">
                  <div className="flex flex-col items-center">
                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-2">
                      <User className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">Resident Photo</span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter resident's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="join_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Joining Date*</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <div className="flex items-center space-x-4 pt-2">
                        <FormControl>
                          <RadioGroup 
                            onValueChange={field.onChange} 
                            value={field.value} 
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="male" id="male" />
                              <label htmlFor="male" className="text-sm">Male</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="female" id="female" />
                              <label htmlFor="female" className="text-sm">Female</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="other" id="other" />
                              <label htmlFor="other" className="text-sm">Other</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="security_deposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Security Deposit (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthly_rent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Rent (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="room_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Room</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a room" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not_assigned">Not Assigned</SelectItem>
                          {rooms
                            .filter(room => room.occupancy < room.capacity || (editMode && currentResident?.room_id === room.id))
                            .map((room) => (
                              <SelectItem key={room.id} value={room.id}>
                                Room {room.room_no} ({room.occupancy}/{room.capacity})
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
                  name="pg_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PG Location</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select PG location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pgLocations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setOpenDialog(false);
                    setEditMode(false);
                    setCurrentResident(null);
                  }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit">{editMode ? "Update" : "Add"} Resident</Button>
              </DialogFooter>
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
              Are you sure you want to delete {residentToDelete?.name}? This action cannot be undone.
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
