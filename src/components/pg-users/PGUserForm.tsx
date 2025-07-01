import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { PG_USER_STATUS } from "@/types/pgUserTypes";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  accommodation_id: z.string().optional(),
  room_type_id: z.string().optional(),
  budget_min: z.number().min(0, "Budget must be positive").optional(),
  budget_max: z.number().min(0, "Budget must be positive").optional(),
  move_in_date: z.string().optional(),
  status: z.string(),
  admin_notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PGUserFormProps {
  initialData?: any;
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

export function PGUserForm({ initialData, onSuccess, onCancel }: PGUserFormProps) {
  const [loading, setLoading] = useState(false);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      accommodation_id: initialData?.accommodation_id || "none",
      room_type_id: initialData?.room_type_id || "none",
      budget_min: initialData?.budget_min || undefined,
      budget_max: initialData?.budget_max || undefined,
      move_in_date: initialData?.move_in_date || "",
      status: initialData?.status || PG_USER_STATUS.NEW,
      admin_notes: initialData?.admin_notes || "",
    },
  });

  // Fetch accommodations and room types
  useEffect(() => {
    async function fetchData() {
      try {
        const [accommodationsRes, roomTypesRes] = await Promise.all([
          supabase.from("accommodations").select("id, name").order("name"),
          supabase.from("room_types").select("id, type, accommodation_id").order("type"),
        ]);

        if (accommodationsRes.error) throw accommodationsRes.error;
        if (roomTypesRes.error) throw roomTypesRes.error;

        setAccommodations(accommodationsRes.data || []);
        setRoomTypes(roomTypesRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load accommodations and room types",
          variant: "destructive",
        });
      }
    }

    fetchData();
  }, [toast]);

  // Filter room types based on selected accommodation
  const selectedAccommodationId = form.watch("accommodation_id");
  const filteredRoomTypes = roomTypes.filter(
    (roomType) => !selectedAccommodationId || roomType.accommodation_id === selectedAccommodationId
  );

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      
      const submitData = {
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        accommodation_id: data.accommodation_id === "none" ? null : data.accommodation_id || null,
        room_type_id: data.room_type_id === "none" ? null : data.room_type_id || null,
        budget_min: data.budget_min || null,
        budget_max: data.budget_max || null,
        move_in_date: data.move_in_date || null,
        status: data.status,
        admin_notes: data.admin_notes || null,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (initialData) {
        // Update existing PG user
        result = await supabase
          .from("pg_users")
          .update(submitData)
          .eq("id", initialData.id)
          .select(`
            *,
            accommodations (name),
            room_types (type)
          `)
          .single();
      } else {
        // Create new PG user
        result = await supabase
          .from("pg_users")
          .insert(submitData)
          .select(`
            *,
            accommodations (name),
            room_types (type)
          `)
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: initialData ? "PG User Updated" : "PG User Added",
        description: `PG user has been successfully ${initialData ? "updated" : "added"}.`,
      });

      onSuccess(result.data);
    } catch (error: any) {
      console.error("Error saving PG user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save PG user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
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
                <FormLabel>Phone *</FormLabel>
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(PG_USER_STATUS).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {key.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
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
            name="accommodation_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Accommodation</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select accommodation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No preference</SelectItem>
                    {accommodations.map((accommodation) => (
                      <SelectItem key={accommodation.id} value={accommodation.id}>
                        {accommodation.name}
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
            name="room_type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Room Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No preference</SelectItem>
                    {filteredRoomTypes.map((roomType) => (
                      <SelectItem key={roomType.id} value={roomType.id}>
                        {roomType.type}
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
            name="budget_min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Budget (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter minimum budget"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budget_max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Budget (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter maximum budget"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="move_in_date"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Preferred Move-in Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="admin_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any additional notes..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : initialData ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}