import React, { useState, useEffect } from 'react';
import { FileText, Heart, Briefcase, Lock, Users, AlertTriangle, Download, Filter, BarChart3, TrendingUp, Activity as ActivityIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  action_description: string;
  category: string;
  entity_id: string | null;
  entity_type: string | null;
  metadata: any;
  created_at: string;
}

const ActivitySection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalUpdates: 0,
    thisMonth: 0,
    categoryBreakdown: {
      medical: 0,
      legal: 0,
      digital: 0,
      personal: 0,
      contact: 0,
      emergency: 0,
    },
    weeklyTrend: [0, 0, 0, 0],
  });

  const categoryIcons = {
    medical: Heart,
    legal: Briefcase,
    digital: Lock,
    personal: FileText,
    contact: Users,
    emergency: AlertTriangle,
  };

  const categoryColors = {
    medical: 'bg-red-100 text-red-700 border-red-200',
    legal: 'bg-blue-100 text-blue-700 border-blue-200',
    digital: 'bg-green-100 text-green-700 border-green-200',
    personal: 'bg-purple-100 text-purple-700 border-purple-200',
    contact: 'bg-orange-100 text-orange-700 border-orange-200',
    emergency: 'bg-rose-100 text-rose-700 border-rose-200',
  };

  // Fetch activities
  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  // Filter activities when category or time range changes
  useEffect(() => {
    filterActivities();
    calculateAnalytics();
  }, [activities, selectedCategory, selectedTimeRange]);

  const fetchActivities = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching activities:', error);
        toast({
          title: "Error",
          description: "Failed to load activity logs.",
          variant: "destructive",
        });
        return;
      }

      setActivities(data || []);
    } catch (error) {
      console.error('Unexpected error fetching activities:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading activities.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAllActivities = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting activities:', error);
        toast({
          title: "Error",
          description: "Failed to delete activity logs.",
          variant: "destructive",
        });
        return;
      }

      setActivities([]);
      setFilteredActivities([]);
      
      toast({
        title: "Activities Deleted",
        description: "All activity logs have been deleted.",
      });
    } catch (error) {
      console.error('Unexpected error deleting activities:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting activities.",
        variant: "destructive",
      });
    }
  };

  const filterActivities = () => {
    let filtered = activities;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(activity => activity.category === selectedCategory);
    }

    // Filter by time range
    const now = new Date();
    const daysAgo = parseInt(selectedTimeRange);
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    filtered = filtered.filter(activity => new Date(activity.created_at) >= cutoffDate);

    setFilteredActivities(filtered);
  };

  const calculateAnalytics = () => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonthActivities = activities.filter(
      activity => new Date(activity.created_at) >= thisMonthStart
    );

    const categoryBreakdown = {
      medical: 0,
      legal: 0,
      digital: 0,
      personal: 0,
      contact: 0,
      emergency: 0,
    };

    activities.forEach(activity => {
      if (activity.category in categoryBreakdown) {
        categoryBreakdown[activity.category as keyof typeof categoryBreakdown]++;
      }
    });

    // Calculate weekly trend (last 4 weeks)
    const weeklyTrend = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      const weekActivities = activities.filter(activity => {
        const activityDate = new Date(activity.created_at);
        return activityDate >= weekStart && activityDate < weekEnd;
      });
      
      weeklyTrend[3 - i] = weekActivities.length;
    }

    setAnalytics({
      totalUpdates: activities.length,
      thisMonth: thisMonthActivities.length,
      categoryBreakdown,
      weeklyTrend,
    });
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    setSelectedCategory(filter);
    
    setTimeout(() => {
      setActiveFilter(null);
    }, 300);
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExportingFormat(format);
    
    setTimeout(() => {
      // Mock export functionality
      const data = filteredActivities.map(activity => ({
        Date: new Date(activity.created_at).toLocaleDateString(),
        Action: activity.action_description,
        Category: activity.category,
        Type: activity.entity_type || 'N/A',
      }));

      if (format === 'csv') {
        const csv = [
          Object.keys(data[0]).join(','),
          ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }

      setExportingFormat(null);
      toast({
        title: "Export Complete",
        description: `Activity log exported as ${format.toUpperCase()}`,
      });
    }, 1000);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const FilterButton: React.FC<{
    onClick: () => void;
    children: React.ReactNode;
    isActive: boolean;
  }> = ({ onClick, children, isActive }) => (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={`relative transition-all duration-300 ${
        isActive 
          ? 'bg-primary text-primary-foreground border-primary' 
          : 'hover:animate-hover-glow'
      } ${activeFilter ? 'animate-pulse' : ''}`}
    >
      {children}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-scale-in" />
      )}
    </Button>
  );

  const ExportButton: React.FC<{
    onClick: () => void;
    format: 'csv' | 'pdf';
    isExporting: boolean;
  }> = ({ onClick, format, isExporting }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={exportingFormat !== null}
      className={`relative transition-all duration-300 hover:animate-hover-glow ${
        isExporting ? 'animate-flash' : ''
      }`}
    >
      <Download className="h-4 w-4 mr-2" />
      {format.toUpperCase()}
      {isExporting && (
        <div className="absolute inset-0 bg-success/20 animate-ripple rounded-md" />
      )}
    </Button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ActivityIcon className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2 sm:px-0">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Activity Log</h2>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0">
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Updates</p>
                <p className="text-2xl sm:text-3xl font-bold">{analytics.totalUpdates}</p>
              </div>
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">This Month</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl sm:text-3xl font-bold animate-fade-in">{analytics.thisMonth}</p>
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                </div>
              </div>
              <ActivityIcon className="h-6 w-6 sm:h-8 sm:w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-3">Weekly Trend</p>
              <div className="flex items-end gap-2 h-6 sm:h-8">
                {analytics.weeklyTrend.map((count, index) => (
                  <div
                    key={index}
                    className="bg-primary/20 rounded-sm flex-1 relative animate-fade-in"
                    style={{ 
                      height: `${Math.max((count / Math.max(...analytics.weeklyTrend)) * 100, 10)}%`,
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div className="absolute -top-4 sm:-top-5 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
                      {count}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span className="hidden sm:inline">4w ago</span>
                <span className="sm:hidden">4w</span>
                <span className="hidden sm:inline">3w ago</span>
                <span className="sm:hidden">3w</span>
                <span className="hidden sm:inline">2w ago</span>
                <span className="sm:hidden">2w</span>
                <span className="hidden sm:inline">1w ago</span>
                <span className="sm:hidden">1w</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Activity by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {Object.entries(analytics.categoryBreakdown).map(([category, count]) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              return (
                <div
                  key={category}
                  className="text-center p-2 sm:p-3 rounded-lg bg-muted/50 transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer"
                  onClick={() => handleFilterClick(category)}
                >
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-primary" />
                  <p className="text-xs sm:text-sm font-medium capitalize">{category}</p>
                  <p className="text-lg sm:text-2xl font-bold text-muted-foreground">{count}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-2 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Category:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterButton
              onClick={() => handleFilterClick('all')}
              isActive={selectedCategory === 'all'}
            >
              All
            </FilterButton>
            {Object.keys(categoryIcons).map(category => (
              <FilterButton
                key={category}
                onClick={() => handleFilterClick(category)}
                isActive={selectedCategory === category}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </FilterButton>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <ExportButton
              onClick={() => handleExport('csv')}
              format="csv"
              isExporting={exportingFormat === 'csv'}
            />
            <ExportButton
              onClick={() => handleExport('pdf')}
              format="pdf"
              isExporting={exportingFormat === 'pdf'}
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteAllActivities}
              className="ml-2"
            >
              Delete All
            </Button>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <ActivityIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No activity found</h3>
              <p className="text-muted-foreground">
                {selectedCategory !== 'all' 
                  ? `No ${selectedCategory} activities in the selected time range` 
                  : 'No activities in the selected time range'
                }
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
              
              <div className="space-y-6">
                {filteredActivities.map((activity, index) => {
                  const Icon = categoryIcons[activity.category as keyof typeof categoryIcons] || FileText;
                  const isExpanded = expandedActivity === activity.id;
                  
                  return (
                    <div 
                      key={activity.id}
                      className="relative flex items-start gap-4 animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Timeline dot */}
                      <div className="flex-shrink-0 w-12 h-12 bg-background border-2 border-primary rounded-full flex items-center justify-center z-10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div 
                          className="bg-card border rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                          onClick={() => setExpandedActivity(isExpanded ? null : activity.id)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${categoryColors[activity.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-700'}`}
                                >
                                  {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(activity.created_at)}
                                </span>
                              </div>
                              <p className="font-medium text-card-foreground">{activity.action_description}</p>
                              
                              {isExpanded && (
                                <div className="mt-3 p-3 bg-muted/50 rounded-md animate-fade-in">
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <span className="font-medium">Action Type:</span> {activity.action_type}
                                    </div>
                                    {activity.entity_type && (
                                      <div>
                                        <span className="font-medium">Entity Type:</span> {activity.entity_type}
                                      </div>
                                    )}
                                    <div>
                                      <span className="font-medium">Full Date:</span> {new Date(activity.created_at).toLocaleString()}
                                    </div>
                                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                      <div>
                                        <span className="font-medium">Details:</span>
                                        <pre className="mt-1 text-xs bg-background p-2 rounded overflow-x-auto">
                                          {JSON.stringify(activity.metadata, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <p className="text-sm font-medium text-muted-foreground">
                                {new Date(activity.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(activity.created_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivitySection;