
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import { CircleDollarSign, Download, TrendingUp } from "lucide-react";

export default function Reports() {
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
        
        <TabsContent value="financial" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title="Total Revenue (May)"
              value="₹72,000"
              subtitle="+12% from last month"
              icon={<CircleDollarSign className="h-5 w-5" />}
            />
            <StatCard
              title="Outstanding Amount"
              value="₹12,500"
              subtitle="4 pending payments"
              icon={<CircleDollarSign className="h-5 w-5" />}
            />
            <StatCard
              title="Average Rent"
              value="₹5,250"
              subtitle="Per resident"
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <StatCard
              title="Expenses (May)"
              value="₹18,500"
              subtitle="-5% from last month"
              icon={<CircleDollarSign className="h-5 w-5" />}
            />
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Monthly Revenue</CardTitle>
              <p className="text-sm text-muted-foreground">Revenue collected over the last 6 months.</p>
            </CardHeader>
            <CardContent className="h-[400px] flex flex-col items-center justify-center">
              <h3 className="text-xl font-semibold mb-2">Monthly Revenue Chart</h3>
              <p className="text-muted-foreground">This is where the revenue chart would be displayed.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="occupancy">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Occupancy Report</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Occupancy statistics and charts will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="residents">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Residents Report</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Resident statistics and details will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
