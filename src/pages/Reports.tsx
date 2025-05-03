
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import { CircleDollarSign, Download, TrendingUp, Users, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Reports() {
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 0,
    outstandingAmount: 0,
    pendingPayments: 0,
    averageRent: 0,
    expenses: 0
  });
  
  const [occupancyStats, setOccupancyStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    occupancyRate: 0,
    averageOccupancy: 0
  });
  
  const [residentStats, setResidentStats] = useState({
    totalResidents: 0,
    activeResidents: 0,
    inactiveResidents: 0,
    newResidents: 0
  });
  
  const [revenueData, setRevenueData] = useState<Array<{ name: string, amount: number }>>([]);
  const [occupancyData, setOccupancyData] = useState<Array<{ name: string, value: number }>>([]);
  const [residentStatusData, setResidentStatusData] = useState<Array<{ name: string, value: number }>>([]);
  
  const [loading, setLoading] = useState(true);

  // Fetch reports data
  useEffect(() => {
    async function fetchReportsData() {
      try {
        setLoading(true);
        
        // Fetch billing data for financial stats
        const { data: billsData, error: billsError } = await supabase
          .from("bills")
          .select("*");
        
        if (billsError) throw billsError;
        
        // Fetch residents data
        const { data: residentsData, error: residentsError } = await supabase
          .from("residents")
          .select("*");
        
        if (residentsError) throw residentsError;
        
        // Fetch rooms data
        const { data: roomsData, error: roomsError } = await supabase
          .from("rooms")
          .select("*");
        
        if (roomsError) throw roomsError;
        
        // Calculate financial stats
        const totalRevenue = billsData?.reduce((sum, bill) => 
          bill.status === "Paid" ? sum + Number(bill.amount) : sum, 0) || 0;
          
        const outstandingAmount = billsData?.reduce((sum, bill) => 
          bill.status === "Pending" ? sum + Number(bill.amount) : sum, 0) || 0;
          
        const pendingPayments = billsData?.filter(bill => bill.status === "Pending").length || 0;
        
        const totalRent = roomsData?.reduce((sum, room) => sum + Number(room.rent), 0) || 0;
        const averageRent = roomsData?.length ? totalRent / roomsData.length : 0;
        
        // Mocking expenses as 25% of revenue for demo
        const expenses = totalRevenue * 0.25;
        
        // Calculate occupancy stats
        const totalRooms = roomsData?.length || 0;
        const occupiedRooms = roomsData?.filter(room => 
          room.occupancy > 0).length || 0;
        const availableRooms = totalRooms - occupiedRooms;
        const occupancyRate = totalRooms ? (occupiedRooms / totalRooms) * 100 : 0;
        
        const totalCapacity = roomsData?.reduce((sum, room) => sum + room.capacity, 0) || 0;
        const totalOccupancy = roomsData?.reduce((sum, room) => sum + room.occupancy, 0) || 0;
        const averageOccupancy = totalCapacity ? (totalOccupancy / totalCapacity) * 100 : 0;
        
        // Calculate resident stats
        const totalResidents = residentsData?.length || 0;
        const activeResidents = residentsData?.filter(resident => 
          resident.status === "Active").length || 0;
        const inactiveResidents = totalResidents - activeResidents;
        
        // Consider residents from the last 30 days as "new"
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const newResidents = residentsData?.filter(resident => 
          new Date(resident.join_date) >= thirtyDaysAgo).length || 0;
        
        // Generate monthly revenue data for the chart
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyRevenueData = Array(6).fill(0).map((_, i) => {
          const monthIndex = (currentMonth - 5 + i) % 12;
          const year = currentYear - (monthIndex > currentMonth ? 1 : 0);
          const month = monthNames[monthIndex];
          
          // Calculate revenue for this month
          const monthRevenue = billsData?.reduce((sum, bill) => {
            const billDate = new Date(bill.bill_date);
            return (billDate.getMonth() === monthIndex && 
                   billDate.getFullYear() === year && 
                   bill.status === "Paid") 
                   ? sum + Number(bill.amount) 
                   : sum;
          }, 0) || 0;
          
          return { name: month, amount: monthRevenue };
        });
        
        // Generate room status data for pie chart
        const roomStatusData = [
          { name: "Occupied", value: occupiedRooms },
          { name: "Available", value: availableRooms }
        ];
        
        // Generate resident status data for pie chart
        const residentData = [
          { name: "Active", value: activeResidents },
          { name: "Inactive", value: inactiveResidents }
        ];
        
        // Update state with calculated data
        setFinancialStats({
          totalRevenue,
          outstandingAmount,
          pendingPayments,
          averageRent,
          expenses
        });
        
        setOccupancyStats({
          totalRooms,
          occupiedRooms,
          availableRooms,
          occupancyRate,
          averageOccupancy
        });
        
        setResidentStats({
          totalResidents,
          activeResidents,
          inactiveResidents,
          newResidents
        });
        
        setRevenueData(monthlyRevenueData);
        setOccupancyData(roomStatusData);
        setResidentStatusData(residentData);
        
      } catch (error) {
        console.error("Error fetching reports data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchReportsData();
  }, []);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Reports</h1>
          <p className="text-muted-foreground">View and generate reports for your hostel.</p>
        </div>
        <Button className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          <span>Export Reports</span>
        </Button>
      </div>

      <Tabs defaultValue="financial">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="residents">Residents</TabsTrigger>
        </TabsList>
        
        {loading ? (
          <div className="flex justify-center items-center h-64 mt-6">
            <p className="text-xl text-muted-foreground">Loading report data...</p>
          </div>
        ) : (
          <>
            <TabsContent value="financial" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard
                  title="Total Revenue (Month)"
                  value={formatCurrency(financialStats.totalRevenue)}
                  subtitle={`${financialStats.pendingPayments} pending payments`}
                  icon={<CircleDollarSign className="h-5 w-5" />}
                />
                <StatCard
                  title="Outstanding Amount"
                  value={formatCurrency(financialStats.outstandingAmount)}
                  subtitle={`${financialStats.pendingPayments} pending payments`}
                  icon={<CircleDollarSign className="h-5 w-5" />}
                />
                <StatCard
                  title="Average Rent"
                  value={formatCurrency(financialStats.averageRent)}
                  subtitle="Per room"
                  icon={<TrendingUp className="h-5 w-5" />}
                />
                <StatCard
                  title="Expenses (Month)"
                  value={formatCurrency(financialStats.expenses)}
                  subtitle="-5% from last month"
                  icon={<CircleDollarSign className="h-5 w-5" />}
                />
              </div>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-xl">Monthly Revenue</CardTitle>
                  <p className="text-sm text-muted-foreground">Revenue collected over the last 6 months.</p>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="amount" fill="#8884d8" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="occupancy">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8 mt-6">
                <StatCard
                  title="Total Rooms"
                  value={occupancyStats.totalRooms.toString()}
                  subtitle="In the hostel"
                  icon={<Home className="h-5 w-5" />}
                />
                <StatCard
                  title="Occupied Rooms"
                  value={occupancyStats.occupiedRooms.toString()}
                  subtitle={`${occupancyStats.occupancyRate.toFixed(1)}% occupancy rate`}
                  icon={<Home className="h-5 w-5" />}
                />
                <StatCard
                  title="Available Rooms"
                  value={occupancyStats.availableRooms.toString()}
                  subtitle="Ready for occupancy"
                  icon={<Home className="h-5 w-5" />}
                />
                <StatCard
                  title="Avg. Occupancy Rate"
                  value={`${occupancyStats.averageOccupancy.toFixed(1)}%`}
                  subtitle="Based on capacity"
                  icon={<TrendingUp className="h-5 w-5" />}
                />
              </div>
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Room Occupancy Status</CardTitle>
                  <p className="text-sm text-muted-foreground">Distribution of occupied and available rooms</p>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center justify-center h-[400px]">
                  <div className="w-full md:w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={occupancyData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {occupancyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} rooms`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2 mt-4 md:mt-0">
                    <h3 className="text-lg font-semibold mb-2">Occupancy Summary</h3>
                    <p className="mb-4">Your hostel currently has {occupancyStats.occupiedRooms} occupied rooms out of {occupancyStats.totalRooms} total rooms, resulting in an occupancy rate of {occupancyStats.occupancyRate.toFixed(1)}%.</p>
                    <div className="flex flex-col gap-2">
                      {occupancyData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-4 h-4" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="text-sm">{item.name}: {item.value} rooms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="residents">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8 mt-6">
                <StatCard
                  title="Total Residents"
                  value={residentStats.totalResidents.toString()}
                  subtitle="All time"
                  icon={<Users className="h-5 w-5" />}
                />
                <StatCard
                  title="Active Residents"
                  value={residentStats.activeResidents.toString()}
                  subtitle="Currently staying"
                  icon={<Users className="h-5 w-5" />}
                />
                <StatCard
                  title="Inactive Residents"
                  value={residentStats.inactiveResidents.toString()}
                  subtitle="Checked out"
                  icon={<Users className="h-5 w-5" />}
                />
                <StatCard
                  title="New Residents"
                  value={residentStats.newResidents.toString()}
                  subtitle="Last 30 days"
                  icon={<Users className="h-5 w-5" />}
                />
              </div>
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Resident Status Distribution</CardTitle>
                  <p className="text-sm text-muted-foreground">Breakdown of active and inactive residents</p>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center justify-center h-[400px]">
                  <div className="w-full md:w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={residentStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {residentStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} residents`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2 mt-4 md:mt-0">
                    <h3 className="text-lg font-semibold mb-2">Resident Summary</h3>
                    <p className="mb-4">Your hostel currently has {residentStats.activeResidents} active residents and {residentStats.inactiveResidents} inactive residents. You've had {residentStats.newResidents} new check-ins in the last 30 days.</p>
                    <div className="flex flex-col gap-2">
                      {residentStatusData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-4 h-4" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="text-sm">{item.name}: {item.value} residents</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
