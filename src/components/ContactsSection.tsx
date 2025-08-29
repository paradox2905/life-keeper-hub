import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Phone, Mail, Share2, Star, User, Edit2, Trash2, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Contact {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  relationship: string;
  avatar_url: string | null;
  is_favorite: boolean;
  is_emergency_contact: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ActivityItem {
  id: string;
  action: string;
  contact: string;
  timestamp: string;
}

const ContactsSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: 'family',
    notes: '',
    is_favorite: false,
    is_emergency_contact: false,
  });

  // Mock activity feed
  const [recentActivity] = useState<ActivityItem[]>([
    { id: '1', action: 'called', contact: 'Dr. Smith', timestamp: '2 hours ago' },
    { id: '2', action: 'emailed', contact: 'Mom', timestamp: '1 day ago' },
    { id: '3', action: 'added', contact: 'John Doe', timestamp: '2 days ago' },
  ]);

  const relationshipColors = {
    family: 'bg-pink-100 text-pink-700 border-pink-200',
    doctor: 'bg-blue-100 text-blue-700 border-blue-200',
    lawyer: 'bg-purple-100 text-purple-700 border-purple-200',
    friend: 'bg-green-100 text-green-700 border-green-200',
    work: 'bg-orange-100 text-orange-700 border-orange-200',
    emergency: 'bg-red-100 text-red-700 border-red-200',
  };

  // Fetch contacts
  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: "Error",
          description: "Failed to load your contacts.",
          variant: "destructive",
        });
        return;
      }

      setContacts(data || []);
    } catch (error) {
      console.error('Unexpected error fetching contacts:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading contacts.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const contactData = {
        ...formData,
        user_id: user.id,
      };

      if (editingContact) {
        const { error } = await supabase
          .from('contacts')
          .update(contactData)
          .eq('id', editingContact.id);

        if (error) throw error;

        // Log activity
        await logActivity('updated', formData.name, 'contact');

        toast({
          title: "Contact updated",
          description: "Contact has been successfully updated.",
        });
      } else {
        const { error } = await supabase
          .from('contacts')
          .insert([contactData]);

        if (error) throw error;

        // Log activity
        await logActivity('added', formData.name, 'contact');

        toast({
          title: "Contact added",
          description: "New contact has been successfully added.",
        });
      }

      resetForm();
      await fetchContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Error",
        description: "Failed to save contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const logActivity = async (action: string, contactName: string, category: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('activity_logs')
        .insert([{
          user_id: user.id,
          action_type: action,
          action_description: `${action.charAt(0).toUpperCase() + action.slice(1)} contact ${contactName}`,
          category,
          entity_type: 'contact',
          metadata: { contact_name: contactName }
        }]);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const handleDelete = async (contact: Contact) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contact.id);

      if (error) throw error;

      // Log activity
      await logActivity('deleted', contact.name, 'contact');

      setContacts(prev => prev.filter(c => c.id !== contact.id));
      toast({
        title: "Contact deleted",
        description: "Contact has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleContactAction = async (action: 'call' | 'email' | 'share', contact: Contact) => {
    setActiveAction(`${action}-${contact.id}`);
    
    setTimeout(async () => {
      switch (action) {
        case 'call':
          if (contact.phone) {
            window.open(`tel:${contact.phone}`);
            await logActivity('called', contact.name, 'contact');
          }
          break;
        case 'email':
          if (contact.email) {
            window.open(`mailto:${contact.email}`);
            await logActivity('emailed', contact.name, 'contact');
          }
          break;
        case 'share':
          if (navigator.share) {
            await navigator.share({
              title: contact.name,
              text: `Contact: ${contact.name}${contact.phone ? ` - ${contact.phone}` : ''}${contact.email ? ` - ${contact.email}` : ''}`,
            });
          }
          await logActivity('shared', contact.name, 'contact');
          break;
      }
      
      setActiveAction(null);
      toast({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} Action`,
        description: `${action.charAt(0).toUpperCase() + action.slice(1)}ed ${contact.name}`,
      });
    }, 600);
  };

  const toggleFavorite = async (contact: Contact) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ is_favorite: !contact.is_favorite })
        .eq('id', contact.id);

      if (error) throw error;

      setContacts(prev => prev.map(c => 
        c.id === contact.id ? { ...c, is_favorite: !c.is_favorite } : c
      ));

      await logActivity(
        contact.is_favorite ? 'unfavorited' : 'favorited', 
        contact.name, 
        'contact'
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      relationship: 'family',
      notes: '',
      is_favorite: false,
      is_emergency_contact: false,
    });
    setIsModalOpen(false);
    setEditingContact(null);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      relationship: contact.relationship,
      notes: contact.notes || '',
      is_favorite: contact.is_favorite,
      is_emergency_contact: contact.is_emergency_contact,
    });
    setIsModalOpen(true);
  };

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.phone?.includes(searchQuery);
    
    const matchesFilter = filterBy === 'all' || 
                         filterBy === 'favorites' && contact.is_favorite ||
                         filterBy === 'recent' && new Date(contact.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ||
                         contact.relationship === filterBy;
    
    return matchesSearch && matchesFilter;
  });

  const ActionButton: React.FC<{
    onClick: () => void;
    icon: React.ReactNode;
    variant: 'call' | 'email' | 'share';
    contactId: string;
    disabled?: boolean;
  }> = ({ onClick, icon, variant, contactId, disabled }) => {
    const isActive = activeAction === `${variant}-${contactId}`;
    
    const getVariantClasses = () => {
      if (isActive) {
        switch (variant) {
          case 'call':
            return 'bg-success text-success-foreground animate-flash';
          case 'email':
            return 'bg-info text-info-foreground animate-slide-check';
          case 'share':
            return 'bg-warning text-warning-foreground animate-slide-check';
        }
      }
      return 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:animate-hover-glow';
    };

    return (
      <Button
        size="sm"
        variant="ghost"
        onClick={onClick}
        disabled={disabled || activeAction !== null}
        className={`relative overflow-hidden transition-all duration-300 ${getVariantClasses()}`}
      >
        {icon}
        {isActive && (
          <div className="absolute inset-0 bg-white/20 animate-ripple rounded-md" />
        )}
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <User className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2 sm:px-0">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Trusted Contacts</h2>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          {/* Search Bar */}
          <div className={`relative transition-all duration-300 ${isSearchExpanded ? 'w-full sm:w-64' : 'w-10'} order-2 sm:order-1`}>
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer" 
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchExpanded(true)}
              onBlur={() => !searchQuery && setIsSearchExpanded(false)}
              className={`pl-10 transition-all duration-300 ${isSearchExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            />
          </div>

          <div className="flex gap-2 order-1 sm:order-2">
            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hover:animate-hover-glow flex-1 sm:flex-none">
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-50 bg-popover border border-border">
                <DropdownMenuItem onClick={() => setFilterBy('all')}>All Contacts</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterBy('favorites')}>Favorites</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterBy('recent')}>Recent</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterBy('family')}>Family</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterBy('doctor')}>Doctor</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterBy('lawyer')}>Lawyer</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterBy('friend')}>Friend</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterBy('work')}>Work</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Contact Button */}
            <Button onClick={() => setIsModalOpen(true)} className="hover:animate-hover-glow flex-1 sm:flex-none">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Contact</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Contacts Grid */}
        <div className="xl:col-span-3">
          {filteredContacts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12 px-4">
                <User className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No contacts found</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  {searchQuery ? 'Try adjusting your search or filters' : 'Add trusted family members or friends'}
                </p>
                <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">Add Your First Contact</Button>
              </CardContent>
            </Card>
          ) : (
            <div className={`grid gap-3 sm:gap-4 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2' : 'grid-cols-1'}`}>
              {filteredContacts.map((contact) => (
                <Card 
                  key={contact.id} 
                  className="transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fade-in"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={contact.avatar_url || ''} />
                          <AvatarFallback>
                            {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {contact.name}
                            {contact.is_favorite && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                            {contact.is_emergency_contact && (
                              <Heart className="h-4 w-4 text-red-500 fill-current" />
                            )}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`text-xs mt-1 ${relationshipColors[contact.relationship as keyof typeof relationshipColors] || 'bg-gray-100 text-gray-700'}`}
                          >
                            {contact.relationship.charAt(0).toUpperCase() + contact.relationship.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="z-50 bg-popover border border-border">
                          <DropdownMenuItem onClick={() => handleEdit(contact)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleFavorite(contact)}>
                            <Star className="h-4 w-4 mr-2" />
                            {contact.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(contact)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {contact.email && (
                      <p className="text-sm text-muted-foreground mb-1">{contact.email}</p>
                    )}
                    {contact.phone && (
                      <p className="text-sm text-muted-foreground mb-3">{contact.phone}</p>
                    )}

                    <div className="flex gap-2">
                      <ActionButton
                        onClick={() => handleContactAction('call', contact)}
                        icon={<Phone className="h-4 w-4" />}
                        variant="call"
                        contactId={contact.id}
                        disabled={!contact.phone}
                      />
                      <ActionButton
                        onClick={() => handleContactAction('email', contact)}
                        icon={<Mail className="h-4 w-4" />}
                        variant="email"
                        contactId={contact.id}
                        disabled={!contact.email}
                      />
                      <ActionButton
                        onClick={() => handleContactAction('share', contact)}
                        icon={<Share2 className="h-4 w-4" />}
                        variant="share"
                        contactId={contact.id}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">
                        {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)} {activity.contact}
                      </p>
                      <p className="text-muted-foreground text-xs">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Contact Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Edit Contact' : 'Add New Contact'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="relationship">Relationship</Label>
              <Select value={formData.relationship} onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="lawyer">Lawyer</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="favorite"
                  checked={formData.is_favorite}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_favorite: checked }))}
                />
                <Label htmlFor="favorite">Add to Favorites</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="emergency"
                  checked={formData.is_emergency_contact}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_emergency_contact: checked }))}
                />
                <Label htmlFor="emergency">Emergency Contact</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingContact ? 'Update Contact' : 'Add Contact'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactsSection;