import React, { useState } from 'react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [location, setLocation] = useState('medical');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [entries, setEntries] = useState({
    medical: 0,
    legal: 0,
    digital: 0,
    personal: 0,
  });
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!title || !file || !location) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsUploading(true);

    try {
      // Create a unique filename with timestamp and user ID
      const timestamp = new Date().toISOString();
      const fileName = `${user.id}/${location}/${timestamp}_${file.name}`;

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('vault')
        .upload(fileName, file);

      if (error) {
        console.error('Upload error:', error);
        alert('Failed to upload file. Please try again.');
        return;
      }

      console.log('File uploaded successfully:', data);

      // Increment the entry count for the selected location
      setEntries((prevEntries) => ({
        ...prevEntries,
        [location]: prevEntries[location as keyof typeof prevEntries] + 1,
      }));

      // Reset the form to its default state
      setTitle('');
      setFile(null);
      setLocation('medical');
      setIsImportant(false);

      // Close the modal
      setIsModalOpen(false);
      
      alert('Entry added successfully!');
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsUploading(false);
    }
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
              <Button className="text-lg px-6 py-3" onClick={() => setIsModalOpen(true)}>
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
                  <p className="text-2xl font-bold text-muted-foreground">{entries.medical} entries</p>
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
                  <p className="text-2xl font-bold text-muted-foreground">{entries.legal} entries</p>
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
                  <p className="text-2xl font-bold text-muted-foreground">{entries.digital} entries</p>
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
                  <p className="text-2xl font-bold text-muted-foreground">{entries.personal} entries</p>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New Entry</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <Label htmlFor="location">Choose Location</Label>
                <select
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="medical">Medical</option>
                  <option value="legal">Legal</option>
                  <option value="digital">Digital</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
              <div className="mb-4">
                <Label htmlFor="title">Title</Label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea id="description" className="w-full border rounded p-2"></textarea>
              </div>
              <div className="mb-4">
                <Label htmlFor="file">Upload File</Label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div className="mb-4 flex items-center">
                <Label htmlFor="important" className="mr-2">Mark as Important</Label>
                <div
                  className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer ${
                    isImportant ? 'bg-green-500' : ''
                  }`}
                  onClick={() => setIsImportant(!isImportant)}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform ${
                      isImportant ? 'translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)} 
                  className="mr-2"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Submit'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;