import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Activity, 
  Settings, 
  LogOut,
  FileText,
  Heart,
  Briefcase,
  Lock,
  Plus
} from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your vault...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">LifeVault</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Welcome, {user.email}
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="vault" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto p-1">
            <TabsTrigger value="vault" className="flex items-center space-x-2 py-3">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:block">Vault</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center space-x-2 py-3">
              <Users className="h-4 w-4" />
              <span className="hidden sm:block">Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center space-x-2 py-3">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:block">Emergency</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center space-x-2 py-3">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:block">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2 py-3">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:block">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vault" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Your Secure Vault</h2>
              <Button className="text-lg px-6 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Add New Entry
              </Button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span>Medical</span>
                  </CardTitle>
                  <CardDescription>Health records, medications, emergency contacts</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-muted-foreground">0 entries</p>
                  <Button variant="ghost" className="w-full mt-3">View & Add</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5 text-blue-500" />
                    <span>Legal</span>
                  </CardTitle>
                  <CardDescription>Wills, insurance, important documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-muted-foreground">0 entries</p>
                  <Button variant="ghost" className="w-full mt-3">View & Add</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="h-5 w-5 text-green-500" />
                    <span>Digital</span>
                  </CardTitle>
                  <CardDescription>Passwords, accounts, digital assets</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-muted-foreground">0 entries</p>
                  <Button variant="ghost" className="w-full mt-3">View & Add</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-purple-500" />
                    <span>Personal</span>
                  </CardTitle>
                  <CardDescription>Personal information, contacts, notes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-muted-foreground">0 entries</p>
                  <Button variant="ghost" className="w-full mt-3">View & Add</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Trusted Contacts</h2>
              <Button className="text-lg px-6 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Add Contact
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contacts</CardTitle>
                <CardDescription>
                  People who can access your vault information in case of emergency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No contacts added yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add trusted family members or friends who should have emergency access
                  </p>
                  <Button>Add Your First Contact</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-6">
            <h2 className="text-3xl font-bold">Emergency Settings</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <span>Inactivity Timer</span>
                  </CardTitle>
                  <CardDescription>
                    Automatically notify contacts if you haven't logged in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Current setting: Not configured
                  </p>
                  <Button variant="outline">Configure Timer</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Panic Button</CardTitle>
                  <CardDescription>
                    Instantly notify your emergency contacts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <Button 
                      variant="destructive" 
                      size="lg"
                      className="w-full h-16 text-xl font-bold"
                    >
                      🚨 EMERGENCY
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Hold for 3 seconds to activate
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <h2 className="text-3xl font-bold">Activity Log</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Track access to your vault and emergency triggers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                  <p className="text-muted-foreground">
                    Your activity history will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-3xl font-bold">Settings</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accessibility</CardTitle>
                  <CardDescription>
                    Customize the interface for better usability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Large Text Mode
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    High Contrast
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Dark Mode
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;