
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/dashboard/StatCard";
import ActivityItem from "@/components/dashboard/ActivityItem";
import QuickAction from "@/components/dashboard/QuickAction";
import { Users, Home, CircleDollarSign, Clock, Bolt } from "lucide-react";

export default function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your hostel management dashboard.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Residents"
          value="24"
          subtitle="+2 from last month"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Room Occupancy"
          value="85%"
          subtitle="3 rooms available"
          icon={<Home className="h-5 w-5" />}
        />
        <StatCard
          title="Monthly Revenue"
          value="₹72,000"
          subtitle="+₹8,000 from last month"
          icon={<CircleDollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Pending Payments"
          value="₹12,500"
          subtitle="4 residents with dues"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-5 mb-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-xl">Recent Activities</CardTitle>
            <p className="text-sm text-muted-foreground">Your hostel's recent activities and updates.</p>
          </CardHeader>
          <CardContent>
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

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <p className="text-sm text-muted-foreground">Frequently used actions for daily management.</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <QuickAction
              icon={<Users className="h-4 w-4" />}
              label="Add New Resident"
              to="/residents/add"
            />
            <QuickAction
              icon={<CircleDollarSign className="h-4 w-4" />}
              label="Create New Bill"
              to="/billing/create"
            />
            <QuickAction
              icon={<Home className="h-4 w-4" />}
              label="Manage Rooms"
              to="/rooms"
            />
            <QuickAction
              icon={<Bolt className="h-4 w-4" />}
              label="Generate Reports"
              to="/reports"
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <StatCard
          title="Electricity Bills"
          value="₹4,160"
          subtitle="520 units consumed"
          icon={<Bolt className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}
