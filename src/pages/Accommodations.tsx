
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import AccommodationsList from "@/components/accommodations/AccommodationsList";
import AccommodationForm from "@/components/accommodations/AccommodationForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Accommodations = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [accommodations, setAccommodations] = useState([]);
  const [activeTab, setActiveTab] = useState("list");
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  // Fetch accommodations data
  const fetchAccommodations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccommodations(data || []);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      toast({
        title: "Error",
        description: "Failed to load accommodations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccommodations();
  }, []);

  // Only admin can access this page
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Accommodations</h1>
          <p className="text-muted-foreground">Manage your hostel accommodations</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">All Accommodations</TabsTrigger>
          <TabsTrigger value="add">Add New</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <AccommodationsList 
            accommodations={accommodations}
            isLoading={isLoading}
            onRefresh={fetchAccommodations}
          />
        </TabsContent>

        <TabsContent value="add">
          <AccommodationForm 
            onSuccess={() => {
              fetchAccommodations();
              setActiveTab("list");
              toast({
                title: "Accommodation added",
                description: "The accommodation has been successfully added",
              });
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Accommodations;
