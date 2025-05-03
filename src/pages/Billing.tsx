
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, MoreHorizontal } from "lucide-react";

export default function Billing() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data for bills
  const bills = [
    { id: 1, invoiceId: "INV-001", resident: "Rahul Sharma", room: "203", amount: "₹6,640", details: "Rent: ₹6,000, Electricity: ₹640", date: "01 May 2023", dueDate: "10 May 2023", status: "Paid" },
    { id: 2, invoiceId: "INV-002", resident: "Priya Patel", room: "105", amount: "₹6,480", details: "Rent: ₹6,000, Electricity: ₹480", date: "01 May 2023", dueDate: "10 May 2023", status: "Pending" },
    { id: 3, invoiceId: "INV-003", resident: "Vikram Singh", room: "302", amount: "₹5,380", details: "Rent: ₹4,500, Electricity: ₹880", date: "01 May 2023", dueDate: "10 May 2023", status: "Paid" },
    { id: 4, invoiceId: "INV-004", resident: "Neha Gupta", room: "107", amount: "₹6,000", details: "Rent only", date: "01 May 2023", dueDate: "10 May 2023", status: "Overdue" },
    { id: 5, invoiceId: "INV-005", resident: "Sanjay Kumar", room: "204", amount: "₹5,000", details: "Rent only", date: "01 May 2023", dueDate: "10 May 2023", status: "Pending" },
    { id: 6, invoiceId: "INV-006", resident: "Ananya Reddy", room: "301", amount: "₹4,500", details: "Rent only", date: "01 May 2023", dueDate: "10 May 2023", status: "Paid" },
  ];
  
  // Filter bills based on search query
  const filteredBills = bills.filter(
    (bill) =>
      bill.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.resident.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.room.includes(searchQuery)
  );

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Billing</h1>
          <p className="text-muted-foreground">Manage all your hostel bills and payments.</p>
        </div>
        <Button className="flex items-center gap-1">
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
              {filteredBills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.invoiceId}</TableCell>
                  <TableCell>{bill.resident}</TableCell>
                  <TableCell>{bill.room}</TableCell>
                  <TableCell>{bill.amount}</TableCell>
                  <TableCell>{bill.details}</TableCell>
                  <TableCell>{bill.date}</TableCell>
                  <TableCell>{bill.dueDate}</TableCell>
                  <TableCell>
                    <StatusBadge status={bill.status} />
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
