import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EntryList from '@/components/EntryList';
import EmergencySection from '@/components/EmergencySection';
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

interface VaultEntry {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  is_important: boolean;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [category, setCategory] = useState('medical');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // View state
  const [currentView, setCurrentView] = useState<'main' | 'entries'>('main');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [editingEntry, setEditingEntry] = useState<VaultEntry | null>(null);

  // Data state
  const [allEntries, setAllEntries] = useState<VaultEntry[]>([]);
  const [entryCounts, setEntryCounts] = useState({
    medical: 0,
    legal: 0,
    digital: 0,
    personal: 0,
  });

  // Fetch entries on component mount and user change
  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('vault_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching entries:', error);
        toast({
          title: "Error",
          description: "Failed to load your vault entries.",
          variant: "destructive",
        });
        return;
      }

      setAllEntries(data || []);
      
      // Calculate counts by category
      const counts = { medical: 0, legal: 0, digital: 0, personal: 0 };
      data?.forEach(entry => {
        if (entry.category in counts) {
          counts[entry.category as keyof typeof counts]++;
        }
      });
      setEntryCounts(counts);
    } catch (error) {
      console.error('Unexpected error fetching entries:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading entries.",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !file || !category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create unique filename
      const timestamp = new Date().toISOString();
      const fileName = `${user!.id}/${category}/${timestamp}_${file.name}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vault')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Upload failed",
          description: "Failed to upload file. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Save entry to database
      const entryData = {
        user_id: user!.id,
        title,
        description: description || null,
        category,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        is_important: isImportant,
      };

      if (editingEntry) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('vault_entries')
          .update(entryData)
          .eq('id', editingEntry.id);

        if (updateError) {
          console.error('Update error:', updateError);
          toast({
            title: "Update failed",
            description: "Failed to update entry. Please try again.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Entry updated",
          description: "Your entry has been successfully updated.",
        });
      } else {
        // Create new entry
        const { error: insertError } = await supabase
          .from('vault_entries')
          .insert([entryData]);

        if (insertError) {
          console.error('Insert error:', insertError);
          toast({
            title: "Save failed",
            description: "Failed to save entry. Please try again.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Entry saved",
          description: "Your entry has been successfully saved.",
        });
      }

      // Reset form and refresh data
      resetForm();
      await fetchEntries();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFile(null);
    setCategory('medical');
    setIsImportant(false);
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const handleViewEntries = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setCurrentView('entries');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedCategory('');
  };

  const handleEditEntry = (entry: VaultEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setDescription(entry.description || '');
    setCategory(entry.category);
    setIsImportant(entry.is_important);
    setIsModalOpen(true);
  };

  const handleDeleteEntry = (entryId: string) => {
    setAllEntries(prev => prev.filter(entry => entry.id !== entryId));
    // Recalculate counts
    const updatedEntries = allEntries.filter(entry => entry.id !== entryId);
    const counts = { medical: 0, legal: 0, digital: 0, personal: 0 };
    updatedEntries.forEach(entry => {
      if (entry.category in counts) {
        counts[entry.category as keyof typeof counts]++;
      }
    });
    setEntryCounts(counts);
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

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

  const getEntriesForCategory = (categoryName: string): VaultEntry[] => {
    return allEntries.filter(entry => entry.category === categoryName);
  };

  // Show entry list view
  if (currentView === 'entries') {
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
          <EntryList
            category={selectedCategory}
            entries={getEntriesForCategory(selectedCategory)}
            onBack={handleBackToMain}
            onEdit={handleEditEntry}
            onDelete={handleDeleteEntry}
            onAddNew={handleAddNew}
          />
        </main>

        {/* Add/Edit Entry Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? 'Edit Entry' : 'Add New Entry'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="file">Upload File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required={!editingEntry}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="important"
                  checked={isImportant}
                  onCheckedChange={setIsImportant}
                />
                <Label htmlFor="important">Mark as Important</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? 'Saving...' : (editingEntry ? 'Update' : 'Save')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

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
                  <p className="text-2xl font-bold text-muted-foreground">{entryCounts.medical} entries</p>
                  <Button variant="ghost" className="w-full mt-3" onClick={() => handleViewEntries('medical')}>View & Add</Button>
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
                  <p className="text-2xl font-bold text-muted-foreground">{entryCounts.legal} entries</p>
                  <Button variant="ghost" className="w-full mt-3" onClick={() => handleViewEntries('legal')}>View & Add</Button>
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
                  <p className="text-2xl font-bold text-muted-foreground">{entryCounts.digital} entries</p>
                  <Button variant="ghost" className="w-full mt-3" onClick={() => handleViewEntries('digital')}>View & Add</Button>
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
                  <p className="text-2xl font-bold text-muted-foreground">{entryCounts.personal} entries</p>
                  <Button variant="ghost" className="w-full mt-3" onClick={() => handleViewEntries('personal')}>View & Add</Button>
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
            <EmergencySection />
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

      {/* Add/Edit Entry Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Edit Entry' : 'Add New Entry'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="file">Upload File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required={!editingEntry}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="important"
                checked={isImportant}
                onCheckedChange={setIsImportant}
              />
              <Label htmlFor="important">Mark as Important</Label>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? 'Saving...' : (editingEntry ? 'Update' : 'Save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;