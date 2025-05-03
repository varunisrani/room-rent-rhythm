
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/dashboard/StatCard";
import ActivityItem from "@/components/dashboard/ActivityItem";
import QuickAction from "@/components/dashboard/QuickAction";
import { 
  Users, Home, CircleDollarSign, Clock, Bolt, 
  TrendingUp, Search, CalendarRange, Wallet, PieChart
} from "lucide-react";
import { motion } from "framer-motion";

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

      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          <StatCard
            title="Total Residents"
            value="24"
            subtitle="+2 from last month"
            icon={<Users className="h-5 w-5" />}
            trend="up"
            trendValue="8.2%"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Room Occupancy"
            value="85%"
            subtitle="3 rooms available"
            icon={<Home className="h-5 w-5" />}
            trend="up"
            trendValue="4.6%"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Monthly Revenue"
            value="₹72,000"
            subtitle="+₹8,000 from last month"
            icon={<CircleDollarSign className="h-5 w-5" />}
            trend="up"
            trendValue="11.2%"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Pending Payments"
            value="₹12,500"
            subtitle="4 residents with dues"
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
            <ActivityItem
              icon={<Users className="h-4 w-4" />}
              title="New Resident Check-in"
              description="Rahul Sharma checked in to Room 203"
              time="2 hours ago"
            />
            <ActivityItem
              icon={<CircleDollarSign className="h-4 w-4" />}
              title="Payment Received"
              description="Priya Patel paid ₹6,000 for Room 105"
              time="5 hours ago"
              highlight
            />
            <ActivityItem
              icon={<Home className="h-4 w-4" />}
              title="Room Maintenance"
              description="Room 302 marked for maintenance"
              time="Yesterday"
            />
            <ActivityItem
              icon={<Users className="h-4 w-4" />}
              title="Resident Check-out"
              description="Amit Kumar checked out from Room 107"
              time="2 days ago"
            />
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
              to="/residents/add"
              description="Register a new resident"
            />
            <QuickAction
              icon={<CircleDollarSign className="h-4 w-4" />}
              label="Create New Bill"
              to="/billing/create"
              description="Generate a billing record"
            />
            <QuickAction
              icon={<Search className="h-4 w-4" />}
              label="Search Records"
              to="/search"
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
          value="₹4,160"
          subtitle="520 units consumed"
          icon={<Bolt className="h-5 w-5" />}
          trend="down"
          trendValue="3.2%"
        />
        <StatCard
          title="Upcoming Renewals"
          value="6"
          subtitle="In the next 14 days"
          icon={<CalendarRange className="h-5 w-5" />}
        />
        <StatCard
          title="Security Deposits"
          value="₹48,000"
          subtitle="From 16 active residents"
          icon={<Wallet className="h-5 w-5" />}
        />
      </motion.div>
    </div>
  );
}
