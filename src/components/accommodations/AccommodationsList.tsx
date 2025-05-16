
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EditIcon, TrashIcon, ImageIcon, Building } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AccommodationImages from "./AccommodationImages";

interface AccommodationsListProps {
  accommodations: any[];
  isLoading: boolean;
  onRefresh: () => void;
}

const AccommodationsList = ({ accommodations, isLoading, onRefresh }: AccommodationsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredAccommodations = accommodations.filter(
    (acc) => 
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const { error } = await supabase.from("accommodations").delete().eq("id", id);
        
        if (error) throw error;
        
        toast({
          title: "Deleted successfully",
          description: `${name} has been removed`,
        });
        onRefresh();
      } catch (error) {
        console.error("Error deleting accommodation:", error);
        toast({
          title: "Error",
          description: "Failed to delete the accommodation",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Accommodations</CardTitle>
          <CardDescription>Loading accommodations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Accommodations</CardTitle>
        <CardDescription>Manage your hostel accommodations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <Input
            placeholder="Search accommodations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" className="ml-2" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
        
        {filteredAccommodations.length === 0 ? (
          <div className="text-center p-8">
            <Building className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-semibold">No accommodations found</h3>
            <p className="text-sm text-muted-foreground">
              {accommodations.length === 0
                ? "Add your first accommodation to get started."
                : "Try a different search term."}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccommodations.map((accommodation) => (
                  <TableRow key={accommodation.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center overflow-hidden">
                          {accommodation.main_image ? (
                            <img
                              src={accommodation.main_image}
                              alt={accommodation.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Building className="h-4 w-4" />
                          )}
                        </div>
                        {accommodation.name}
                      </div>
                    </TableCell>
                    <TableCell>{accommodation.code}</TableCell>
                    <TableCell>{accommodation.address}</TableCell>
                    <TableCell>{accommodation.contact}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {accommodation.features && accommodation.features.length > 0 ? (
                          accommodation.features.slice(0, 2).map((feature: string, idx: number) => (
                            <Badge key={idx} variant="outline">
                              {feature}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No features</span>
                        )}
                        {accommodation.features && accommodation.features.length > 2 && (
                          <Badge variant="outline">+{accommodation.features.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <ImageIcon className="h-4 w-4 mr-1" /> Gallery
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Image Gallery - {accommodation.name}</DialogTitle>
                            </DialogHeader>
                            <AccommodationImages 
                              accommodationId={accommodation.id} 
                              accommodationName={accommodation.name}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDelete(accommodation.id, accommodation.name)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t px-6 py-4 flex justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAccommodations.length} of {accommodations.length} accommodations
        </p>
      </CardFooter>
    </Card>
  );
};

export default AccommodationsList;
