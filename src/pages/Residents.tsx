
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

export default function Residents() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data for residents
  const residents = [
    { id: 1, name: "Rahul Sharma", room: "203", phone: "9876543210", joinDate: "15 Apr 2023", status: "Active" },
    { id: 2, name: "Priya Patel", room: "105", phone: "8765432109", joinDate: "02 Jan 2023", status: "Active" },
    { id: 3, name: "Vikram Singh", room: "302", phone: "7654321098", joinDate: "10 Mar 2023", status: "Active" },
    { id: 4, name: "Neha Gupta", room: "107", phone: "6543210987", joinDate: "22 Feb 2023", status: "Active" },
    { id: 5, name: "Sanjay Kumar", room: "204", phone: "5432109876", joinDate: "05 May 2023", status: "Active" },
    { id: 6, name: "Ananya Reddy", room: "301", phone: "4321098765", joinDate: "18 Jun 2023", status: "Active" },
  ];
  
  // Filter residents based on search query
  const filteredResidents = residents.filter(
    (resident) =>
      resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.room.includes(searchQuery) ||
      resident.phone.includes(searchQuery)
  );

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Residents</h1>
          <p className="text-muted-foreground">Manage all your hostel residents in one place.</p>
        </div>
        <Button className="flex items-center gap-1">
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
              {filteredResidents.map((resident) => (
                <TableRow key={resident.id}>
                  <TableCell className="font-medium">{resident.name}</TableCell>
                  <TableCell>{resident.room}</TableCell>
                  <TableCell>{resident.phone}</TableCell>
                  <TableCell>{resident.joinDate}</TableCell>
                  <TableCell>
                    <StatusBadge status={resident.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
