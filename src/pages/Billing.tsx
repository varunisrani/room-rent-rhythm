
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Bill, Resident } from "@/types/hostelTypes";
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Billing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bills, setBills] = useState<Bill[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      resident_id: "",
      amount: 0,
      details: "",
      due_date: "",
    },
  });
  
  // Generate an invoice ID
  const generateInvoiceId = () => {
    const prefix = "INV";
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    return `${prefix}-${date}-${randomNum}`;
  };
  
  // Format date for input field
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Set default due date to 10 days from now
  useEffect(() => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 10);
    form.setValue("due_date", formatDateForInput(dueDate));
  }, [form]);
  
  // Fetch bills
  useEffect(() => {
    async function fetchBills() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("bills")
          .select(`
            id,
            invoice_id,
            amount,
            details,
            bill_date,
            due_date,
            status,
            created_at,
            updated_at,
            resident_id,
            residents(name, room_id, rooms(room_no))
          `)
          .order("created_at", { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedData = data.map(item => ({
            ...item,
            resident_name: item.residents?.name || 'Unknown',
            room: item.residents?.rooms?.room_no || 'Not Assigned'
          }));
          setBills(formattedData as unknown as Bill[]);
        }
      } catch (error: any) {
        toast({
          title: "Error fetching bills",
          description: error.message || "Failed to load bills",
          variant: "destructive",
        });
        console.error("Error fetching bills:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchBills();
  }, [toast]);
  
  // Fetch residents for the form
  useEffect(() => {
    async function fetchResidents() {
      try {
        const { data, error } = await supabase
          .from("residents")
          .select(`
            id,
            name,
            room_id,
            rooms(room_no)
          `)
          .eq("status", "Active")
          .order("name");
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setResidents(data);
        }
      } catch (error: any) {
        toast({
          title: "Error fetching residents",
          description: error.message || "Failed to load residents",
          variant: "destructive",
        });
        console.error("Error fetching residents:", error);
      }
    }
    
    fetchResidents();
  }, [toast]);
  
  // Filter bills based on search query
  const filteredBills = bills.filter(
    (bill: any) =>
      bill.invoice_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.resident_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.room?.includes(searchQuery)
  );
  
  const onSubmit = async (values: any) => {
    try {
      const invoiceId = generateInvoiceId();
      const { data, error } = await supabase
        .from("bills")
        .insert([
          {
            invoice_id: invoiceId,
            resident_id: values.resident_id,
            amount: values.amount,
            details: values.details || null,
            bill_date: new Date().toISOString(),
            due_date: new Date(values.due_date).toISOString(),
            status: "Pending"
          }
        ])
        .select();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        // Find resident
        const resident = residents.find(r => r.id === values.resident_id);
        const newBill = {
          ...data[0],
          resident_name: resident?.name || 'Unknown',
          room: resident?.rooms?.room_no || 'Not Assigned'
        };
        
        setBills([newBill as unknown as Bill, ...bills]);
        
        toast({
          title: "Bill created successfully",
          description: `Invoice ${invoiceId} has been created.`,
        });
        
        setOpenDialog(false);
        form.reset();
        
        // Set default due date again
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 10);
        form.setValue("due_date", formatDateForInput(dueDate));
      }
    } catch (error: any) {
      toast({
        title: "Error creating bill",
        description: error.message || "Failed to create bill",
        variant: "destructive",
      });
      console.error("Error creating bill:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Billing</h1>
          <p className="text-muted-foreground">Manage all your hostel bills and payments.</p>
        </div>
        <Button className="flex items-center gap-1" onClick={() => setOpenDialog(true)}>
          <Plus className="h-4 w-4" />
          <span>Create Bill</span>
        </Button>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bills..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">All Bills</CardTitle>
          <p className="text-sm text-muted-foreground">A list of all bills generated for your hostel residents.</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Loading bills...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Resident</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.length > 0 ? (
                  filteredBills.map((bill: any) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.invoice_id}</TableCell>
                      <TableCell>{bill.resident_name}</TableCell>
                      <TableCell>{bill.room}</TableCell>
                      <TableCell>₹{bill.amount}</TableCell>
                      <TableCell>{bill.details || "-"}</TableCell>
                      <TableCell>{new Date(bill.bill_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(bill.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <StatusBadge status={bill.status} />
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
                      {searchQuery ? "No bills matching your search" : "No bills found. Create some bills to get started."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Create Bill Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Bill</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new bill for a resident.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="resident_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resident</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a resident" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {residents.map((resident: any) => (
                          <SelectItem key={resident.id} value={resident.id}>
                            {resident.name} {resident.rooms && `(Room ${resident.rooms.room_no})`}
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Amount (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter bill amount"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value || '0'))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Details (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter bill details like rent, electricity, etc."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
                <Button type="submit">Create Bill</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
