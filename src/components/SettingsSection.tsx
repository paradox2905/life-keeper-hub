import React, { useState } from 'react';
import { Settings, User, Lock, Bell, Shield, Palette, Download, Trash2, Eye, EyeOff, Sun, Moon, Monitor, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useTheme } from 'next-themes';
import { supabase } from '@/integrations/supabase/client';

const SettingsSection: React.FC = () => {
  const { user } = useAuth();
  const { profile, updateDisplayName } = useUserProfile();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  // Profile settings - sync with context
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
  });

  // Update local state when profile changes
  React.useEffect(() => {
    if (profile) {
      setProfileData({
        displayName: profile.displayName,
        email: profile.email,
      });
    }
  }, [profile]);

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    emergencyAlerts: true,
    documentReminders: false,
    weeklyReports: true,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: false,
    dataSharing: false,
    analyticsTracking: true,
  });

  const handleProfileUpdate = async () => {
    try {
      await updateDisplayName(profileData.displayName);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDataExport = () => {
    toast({
      title: "Data Export Started",
      description: "Your data export will be ready for download shortly.",
    });
    // Mock export functionality
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your data has been exported successfully.",
      });
    }, 3000);
  };

  // Account deletion
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAccountDeletion = async () => {
    setIsDeleting(true);
    
    try {
      const { error } = await supabase.rpc('delete_user');
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete account. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      // Sign out the user
      await supabase.auth.signOut();
      
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 px-2 sm:px-0">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-2 sm:p-3 rounded-xl">
          <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Profile Settings */}
        <Card className="transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="displayName" className="text-sm">Display Name</Label>
              <Input
                id="displayName"
                value={profileData.displayName}
                onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                className="mt-1 text-sm sm:text-base"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                disabled
                className="mt-1 bg-muted text-sm sm:text-base"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Contact support to change your email address
              </p>
            </div>
            <Button onClick={handleProfileUpdate} className="w-full text-sm sm:text-base">
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card className="transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-amber-500/5 to-transparent rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="currentPassword" className="text-sm">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="mt-1 pr-10 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.current ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="newPassword" className="text-sm">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="mt-1 pr-10 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.new ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="mt-1 pr-10 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.confirm ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
                </button>
              </div>
            </div>

            <Button 
              onClick={handlePasswordChange} 
              className="w-full text-sm sm:text-base" 
              disabled={isChangingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            >
              {isChangingPassword ? "Changing Password..." : "Change Password"}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-green-500/5 to-transparent rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Label className="text-sm">Email Notifications</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">Receive important updates via email</p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Label className="text-sm">Emergency Alerts</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">Critical emergency notifications</p>
              </div>
              <Switch
                checked={notifications.emergencyAlerts}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emergencyAlerts: checked }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Label className="text-sm">Document Reminders</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">Reminders for document updates</p>
              </div>
              <Switch
                checked={notifications.documentReminders}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, documentReminders: checked }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Label className="text-sm">Weekly Reports</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">Weekly activity summaries</p>
              </div>
              <Switch
                checked={notifications.weeklyReports}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReports: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance & Theme */}
        <Card className="transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-purple-500/5 to-transparent rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg">
                <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <Label className="text-sm">Theme Preference</Label>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Choose your preferred theme</p>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-red-500/5 to-transparent rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-lg">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Label className="text-sm">Profile Visibility</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">Make profile visible to others</p>
              </div>
              <Switch
                checked={privacy.profileVisibility}
                onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, profileVisibility: checked }))}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Label className="text-sm">Data Sharing</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">Allow data sharing for improvements</p>
              </div>
              <Switch
                checked={privacy.dataSharing}
                onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, dataSharing: checked }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Label className="text-sm">Analytics Tracking</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">Help improve the app with usage data</p>
              </div>
              <Switch
                checked={privacy.analyticsTracking}
                onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, analyticsTracking: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Management */}
      <Card className="transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4 bg-gradient-to-r from-indigo-500/5 to-transparent rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 rounded-lg">
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              onClick={handleDataExport}
              variant="outline"
              className="flex-1 text-sm sm:text-base bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 border-indigo-200 hover:border-indigo-300 text-indigo-700 hover:text-indigo-800 transition-all duration-300"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="hidden sm:inline">Export All Data</span>
              <span className="sm:hidden">Export Data</span>
            </Button>
            
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="destructive"
              className="flex-1 text-sm sm:text-base bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 transition-all duration-300"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="hidden sm:inline">Delete Account</span>
              <span className="sm:hidden">Delete</span>
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4">
            Export your data or permanently delete your account. Account deletion cannot be undone.
          </p>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers including:
              <ul className="list-disc list-inside mt-2 space-y-1 text-xs sm:text-sm">
                <li>All vault entries and uploaded files</li>
                <li>Emergency contacts and settings</li>
                <li>Activity logs and preferences</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-3">
            <AlertDialogCancel disabled={isDeleting} className="text-sm sm:text-base">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAccountDeletion}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm sm:text-base"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsSection;