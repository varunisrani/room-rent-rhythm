
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and preferences.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your general application settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>General settings content will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users and their access permissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>User management content will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure your notification preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Notification settings content will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
