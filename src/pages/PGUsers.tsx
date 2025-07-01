import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, MoreHorizontal } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PGManageForm } from "@/components/pg-users/PGManageForm";
import { PGManage } from "@/types/pgUserTypes";

export default function PGUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pgManage, setPGManage] = useState<PGManage[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPGManage, setCurrentPGManage] = useState<PGManage | null>(null);
  const { toast } = useToast();

  // Fetch PG manage users
  useEffect(() => {
    async function fetchPGManage() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("pg_manage")
          .select("*")
          .order("name", { ascending: true });

        if (error) {
          throw error;
        }

        if (data) {
          setPGManage(data);
          console.log("PG Manage loaded:", data);
        }
      } catch (error: any) {
        toast({
          title: "Error fetching PG manage users",
          description: error.message || "Failed to load PG manage users",
          variant: "destructive",
        });
        console.error("Error fetching PG manage users:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPGManage();
  }, [toast]);

  // Filter PG manage users based on search query
  const filteredPGManage = pgManage.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (pgUser: PGManage) => {
    setCurrentPGManage(pgUser);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = async (pgUser: PGManage) => {
    if (!confirm("Are you sure you want to delete this PG manage user?")) return;

    try {
      const { error } = await supabase
        .from("pg_manage")
        .delete()
        .eq("id", pgUser.id);

      if (error) throw error;

      setPGManage(pgManage.filter((u) => u.id !== pgUser.id));
      toast({
        title: "PG manage user deleted",
        description: "The PG manage user has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting PG manage user",
        description: error.message || "Failed to delete PG manage user",
        variant: "destructive",
      });
    }
  };

  const onFormSubmitSuccess = (updatedPGManage: PGManage) => {
    if (editMode) {
      setPGManage(pgManage.map((u) => (u.id === updatedPGManage.id ? updatedPGManage : u)));
    } else {
      setPGManage([updatedPGManage, ...pgManage]);
    }
    setOpenDialog(false);
    setEditMode(false);
    setCurrentPGManage(null);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">PG Manage</CardTitle>
          <Button onClick={() => {
            setEditMode(false);
            setCurrentPGManage(null);
            setOpenDialog(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add PG User
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
              prefix={<Search className="h-4 w-4 text-gray-400" />}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>PG Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredPGManage.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No PG users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPGManage.map((pgUser) => (
                    <TableRow key={pgUser.id}>
                      <TableCell>{pgUser.name}</TableCell>
                      <TableCell>
                        <span className="font-mono">{"*".repeat(8)}</span>
                      </TableCell>
                      <TableCell>{pgUser.pg_name || "No PG Selected"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(pgUser)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(pgUser)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit PG User" : "Add New PG User"}
            </DialogTitle>
            <DialogDescription>
              {editMode ? "Update the PG user credentials below." : "Fill in the name and password for the new PG user."}
            </DialogDescription>
          </DialogHeader>
          <PGManageForm
            initialData={currentPGManage}
            onSuccess={onFormSubmitSuccess}
            onCancel={() => setOpenDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 