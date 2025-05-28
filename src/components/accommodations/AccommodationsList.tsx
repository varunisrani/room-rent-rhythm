import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AccommodationImages from "./AccommodationImages";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AccommodationsListProps {
  accommodations: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onEdit: (accommodation: any) => void;
}

const AccommodationsList = ({ accommodations, isLoading, onRefresh, onEdit }: AccommodationsListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { toast } = useToast();

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const { error } = await supabase
        .from("accommodations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Deleted successfully",
        description: `${name} has been deleted`,
      });

      onRefresh();
    } catch (error) {
      console.error("Error deleting accommodation:", error);
      toast({
        title: "Error",
        description: "Failed to delete accommodation",
        variant: "destructive",
      });
    }
  };

  const filteredAccommodations = accommodations.filter((accommodation) => {
    const matchesSearch = 
      accommodation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      accommodation.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      accommodation.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      categoryFilter === "all" || 
      accommodation.pg_category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accommodations</CardTitle>
        <CardDescription>Manage your PG accommodations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search accommodations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="girls">Girls PG</SelectItem>
              <SelectItem value="boys">Boys PG</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : filteredAccommodations.length === 0 ? (
          <div className="text-center py-4">No accommodations found</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
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
                    <TableCell>
                      <Badge variant={accommodation.pg_category === 'girls' ? 'pink' : 'blue'}>
                        {accommodation.pg_category === 'girls' ? 'Girls PG' : 'Boys PG'}
                      </Badge>
                    </TableCell>
                    <TableCell>{accommodation.code}</TableCell>
                    <TableCell>{accommodation.address}</TableCell>
                    <TableCell>{accommodation.contact}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {accommodation.features?.map((feature: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
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
                          variant="outline" 
                          size="sm"
                          onClick={() => onEdit(accommodation)}
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
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
    </Card>
  );
};

export default AccommodationsList;
