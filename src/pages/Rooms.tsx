
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, MoreHorizontal } from "lucide-react";

export default function Rooms() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data for rooms
  const rooms = [
    { id: 1, roomNo: "101", type: "Single", floor: "1st", capacity: 1, occupancy: 1, rent: "₹6,000", status: "Occupied" },
    { id: 2, roomNo: "102", type: "Single", floor: "1st", capacity: 1, occupancy: 1, rent: "₹6,000", status: "Occupied" },
    { id: 3, roomNo: "103", type: "Double", floor: "1st", capacity: 2, occupancy: 1, rent: "₹5,000", status: "Partially Occupied" },
    { id: 4, roomNo: "201", type: "Double", floor: "2nd", capacity: 2, occupancy: 2, rent: "₹5,000", status: "Occupied" },
    { id: 5, roomNo: "202", type: "Triple", floor: "2nd", capacity: 3, occupancy: 3, rent: "₹4,500", status: "Occupied" },
    { id: 6, roomNo: "301", type: "Triple", floor: "3rd", capacity: 3, occupancy: 0, rent: "₹4,500", status: "Available" },
  ];
  
  // Filter rooms based on search query
  const filteredRooms = rooms.filter(
    (room) =>
      room.roomNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Rooms</h1>
          <p className="text-muted-foreground">Manage all your hostel rooms and their status.</p>
        </div>
        <Button className="flex items-center gap-1">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room No.</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.roomNo}</TableCell>
                  <TableCell>{room.type}</TableCell>
                  <TableCell>{room.floor}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>{room.occupancy}</TableCell>
                  <TableCell>{room.rent}</TableCell>
                  <TableCell>
                    <StatusBadge status={room.status} />
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
