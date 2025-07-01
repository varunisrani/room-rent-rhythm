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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { PGManage, PGManageFormData } from "@/types/pgUserTypes";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  pg_name: z.string().optional(),
});

interface PGManageFormProps {
  initialData?: PGManage | null;
  onSuccess: (data: PGManage) => void;
  onCancel: () => void;
}

export function PGManageForm({ initialData, onSuccess, onCancel }: PGManageFormProps) {
  const [loading, setLoading] = useState(false);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const { toast } = useToast();

  const form = useForm<PGManageFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      password: initialData?.password || "",
      pg_name: initialData?.pg_name || "none",
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

  const onSubmit = async (data: PGManageFormData) => {
    try {
      setLoading(true);
      
      const submitData = {
        name: data.name,
        password: data.password,
        pg_name: data.pg_name === "none" ? null : data.pg_name || null,
      };

      let result;
      if (initialData) {
        // Update existing PG manage user
        result = await supabase
          .from("pg_manage")
          .update(submitData)
          .eq("id", initialData.id)
          .select()
          .single();
      } else {
        // Create new PG manage user
        result = await supabase
          .from("pg_manage")
          .insert(submitData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: initialData ? "PG User Updated" : "PG User Added",
        description: `PG user has been successfully ${initialData ? "updated" : "added"}.`,
      });

      onSuccess(result.data);
    } catch (error: any) {
      console.error("Error saving PG manage user:", error);
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password *</FormLabel>
              <FormControl>
                <Input 
                  type="text" 
                  placeholder={initialData ? "Current password shown" : "Enter password"} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
              {initialData && (
                <p className="text-xs text-muted-foreground">
                  Current password is displayed. You can modify it if needed.
                </p>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pg_name"
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