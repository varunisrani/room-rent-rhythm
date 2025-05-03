
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/dashboard/StatCard";
import ActivityItem from "@/components/dashboard/ActivityItem";
import QuickAction from "@/components/dashboard/QuickAction";
import { 
  Users, Home, CircleDollarSign, Clock, Bolt, 
  TrendingUp, Search, CalendarRange, Wallet, PieChart
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Resident, Room, Bill } from "@/types/hostelTypes";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalResidents: 0,
    roomOccupancy: 0,
    availableRooms: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    pendingPaymentsCount: 0,
    electricityBill: 0,
    upcomingRenewals: 0,
    securityDeposits: 0
  });
  
  const [activities, setActivities] = useState<Array<{
    type: string;
    title: string;
    description: string;
    time: string;
    highlight?: boolean;
  }>>([]);

  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // Fetch residents count
        const { count: residentsCount, error: residentsError } = await supabase
          .from("residents")
          .select("*", { count: "exact", head: true })
          .eq("status", "Active");
        
        if (residentsError) throw residentsError;
        
        // Fetch rooms data for occupancy
        const { data: roomsData, error: roomsError } = await supabase
          .from("rooms")
          .select("*");
        
        if (roomsError) throw roomsError;
        
        // Calculate room occupancy
        const totalRooms = roomsData.length;
        const totalCapacity = roomsData.reduce((sum, room) => sum + room.capacity, 0);
        const totalOccupancy = roomsData.reduce((sum, room) => sum + room.occupancy, 0);
        const occupancyPercentage = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;
        const availableRooms = roomsData.filter(room => room.occupancy < room.capacity).length;
        
        // Fetch billing data
        const { data: billsData, error: billsError } = await supabase
          .from("bills")
          .select("*");
        
        if (billsError) throw billsError;
        
        // Calculate finances
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyBills = billsData?.filter(bill => {
          const billDate = new Date(bill.bill_date);
          return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
        }) || [];
        
        const monthlyRevenue = monthlyBills.reduce((sum, bill) => sum + Number(bill.amount), 0);
        
        const pendingBills = billsData?.filter(bill => bill.status === "Pending") || [];
        const pendingPayments = pendingBills.reduce((sum, bill) => sum + Number(bill.amount), 0);
        
        // Fetch electricity data
        const { data: electricityData, error: electricityError } = await supabase
          .from("electricity_readings")
          .select("*");
        
        if (electricityError) throw electricityError;
        
        // Calculate electricity bill for current month
        const monthlyElectricity = electricityData?.filter(reading => {
          const readingDate = new Date(reading.reading_date);
          return readingDate.getMonth() === currentMonth && readingDate.getFullYear() === currentYear;
        }) || [];
        
        const electricityBill = monthlyElectricity.reduce((sum, reading) => sum + Number(reading.amount), 0);
        
        // Recent activities
        const { data: recentResidents, error: recentResidentsError } = await supabase
          .from("residents")
          .select(`*, rooms(room_no)`)
          .order("created_at", { ascending: false })
          .limit(3);
        
        if (recentResidentsError) throw recentResidentsError;
        
        const { data: recentBills, error: recentBillsError } = await supabase
          .from("bills")
          .select(`*, residents(name)`)
          .order("created_at", { ascending: false })
          .limit(2);
        
        if (recentBillsError) throw recentBillsError;
        
        // Format activities
        const formattedActivities = [
          ...(recentResidents || []).map((resident: any) => ({
            type: "resident",
            title: resident.created_at === resident.updated_at ? "New Resident Check-in" : "Resident Updated",
            description: `${resident.name} ${resident.created_at === resident.updated_at ? 
              `checked in to Room ${resident.rooms?.room_no || 'Not Assigned'}` : 
              `information was updated`}`,
            time: formatTimeAgo(new Date(resident.created_at)),
          })),
          ...(recentBills || []).map((bill: any) => ({
            type: "payment",
            title: "Payment " + (bill.status === "Paid" ? "Received" : "Created"),
            description: `${bill.residents?.name || 'Resident'} ${bill.status === "Paid" ? 
              `paid` : `billed`} ₹${bill.amount} for Invoice #${bill.invoice_id}`,
            time: formatTimeAgo(new Date(bill.created_at)),
            highlight: bill.status === "Paid",
          })),
        ].sort((a, b) => 
          new Date(b.time).getTime() - new Date(a.time).getTime()
        ).slice(0, 4);
        
        setStats({
          totalResidents: residentsCount || 0,
          roomOccupancy: occupancyPercentage,
          availableRooms: availableRooms,
          monthlyRevenue: monthlyRevenue,
          pendingPayments: pendingPayments,
          pendingPaymentsCount: pendingBills.length,
          electricityBill: electricityBill,
          upcomingRenewals: 0, // This would need a join date + renewal period calculation
          securityDeposits: residentsCount ? residentsCount * 3000 : 0 // Assuming ₹3000 security deposit per resident
        });
        
        setActivities(formattedActivities);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);
  
  function formatTimeAgo(date: Date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString();
  }

  return (
    <div>
      <div className="mb-8">
        <motion.h1 
          className="text-3xl font-bold mb-2 bg-gradient-to-r from-premium-800 to-premium-accent bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome to Your Dashboard
        </motion.h1>
        <motion.p 
          className="text-premium-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Overview of your hostel management metrics and activities
        </motion.p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-premium-600">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={itemVariants}>
              <StatCard
                title="Total Residents"
                value={stats.totalResidents.toString()}
                subtitle="Active residents currently"
                icon={<Users className="h-5 w-5" />}
                trend="up"
                trendValue="8.2%"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                title="Room Occupancy"
                value={`${stats.roomOccupancy}%`}
                subtitle={`${stats.availableRooms} ${stats.availableRooms === 1 ? 'room' : 'rooms'} available`}
                icon={<Home className="h-5 w-5" />}
                trend="up"
                trendValue="4.6%"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                title="Monthly Revenue"
                value={`₹${stats.monthlyRevenue.toLocaleString()}`}
                subtitle="From rent and services"
                icon={<CircleDollarSign className="h-5 w-5" />}
                trend="up"
                trendValue="11.2%"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                title="Pending Payments"
                value={`₹${stats.pendingPayments.toLocaleString()}`}
                subtitle={`${stats.pendingPaymentsCount} ${stats.pendingPaymentsCount === 1 ? 'resident' : 'residents'} with dues`}
                icon={<Clock className="h-5 w-5" />}
                trend="down"
                trendValue="6.8%"
              />
            </motion.div>
          </motion.div>

          <motion.div 
            className="grid gap-6 md:grid-cols-1 lg:grid-cols-5 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="lg:col-span-3 premium-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-premium-accent" />
                  Recent Activities
                </CardTitle>
                <p className="text-sm text-premium-600">Your hostel's recent activities and updates</p>
              </CardHeader>
              <CardContent className="pt-2">
                {activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <ActivityItem
                      key={index}
                      icon={
                        activity.type === "resident" ? <Users className="h-4 w-4" /> : 
                        activity.type === "payment" ? <CircleDollarSign className="h-4 w-4" /> :
                        activity.type === "maintenance" ? <Home className="h-4 w-4" /> :
                        <Clock className="h-4 w-4" />
                      }
                      title={activity.title}
                      description={activity.description}
                      time={activity.time}
                      highlight={activity.highlight}
                    />
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">No recent activities to show</p>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 premium-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Bolt className="h-5 w-5 text-premium-accent" />
                  Quick Actions
                </CardTitle>
                <p className="text-sm text-premium-600">Frequently used management functions</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-3">
                <QuickAction
                  icon={<Users className="h-4 w-4" />}
                  label="Add New Resident"
                  to="/residents"
                  description="Register a new resident"
                />
                <QuickAction
                  icon={<CircleDollarSign className="h-4 w-4" />}
                  label="Create New Bill"
                  to="/billing"
                  description="Generate a billing record"
                />
                <QuickAction
                  icon={<Search className="h-4 w-4" />}
                  label="Search Records"
                  to="/residents"
                  description="Find residents or rooms"
                />
                <QuickAction
                  icon={<PieChart className="h-4 w-4" />}
                  label="Generate Reports"
                  to="/reports"
                  description="View and export data reports"
                />
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div 
            className="grid gap-6 md:grid-cols-3 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <StatCard
              title="Electricity Bills"
              value={`₹${stats.electricityBill.toLocaleString()}`}
              subtitle="This month's consumption"
              icon={<Bolt className="h-5 w-5" />}
              trend="down"
              trendValue="3.2%"
            />
            <StatCard
              title="Upcoming Renewals"
              value={stats.upcomingRenewals.toString()}
              subtitle="In the next 14 days"
              icon={<CalendarRange className="h-5 w-5" />}
            />
            <StatCard
              title="Security Deposits"
              value={`₹${stats.securityDeposits.toLocaleString()}`}
              subtitle={`From ${stats.totalResidents} active residents`}
              icon={<Wallet className="h-5 w-5" />}
            />
          </motion.div>
        </>
      )}
    </div>
  );
}
