import React from 'react';
import { Card, CardContent } from './card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './table';
import { Button } from './button';
import { Activity, RefreshCw, ArrowUpDown, Filter } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';
import { Input } from './input';
import { activityService, ActivityLog } from '@/lib/activity-service';
import { toast } from 'sonner';

const ACTIVITY_TYPES = [
  'All Activities',
  'Token Stakes',
  'Token Unstakes',
  'Rewards Claims',
  'KYC Updates',
  'Settings Changes',
  'Security Events'
];

export function ActivityLogPanel() {
  const [activities, setActivities] = React.useState<ActivityLog[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [filter, setFilter] = React.useState('All Activities');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState({
    key: 'created_at',
    direction: 'desc'
  });

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await activityService.getActivityLog();
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activity log:', error);
      toast.error('Failed to load activity log');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadActivities();
  }, []);

  const handleSort = (key: keyof ActivityLog) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });

    const sortedActivities = [...activities].sort((a, b) => {
      if (sortConfig.direction === 'asc') {
        return a[key] > b[key] ? 1 : -1;
      }
      return a[key] < b[key] ? 1 : -1;
    });

    setActivities(sortedActivities);
  };

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'All Activities' || 
      activity.action.toLowerCase().includes(filter.toLowerCase().replace(' ', '_'));
    
    const matchesSearch = !searchQuery || 
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.details.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'medium'
    }).format(date);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Activity Log</h2>
          </div>
          <Button variant="outline" onClick={loadActivities} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('created_at')}
                    className="h-8 flex items-center gap-1"
                  >
                    Date <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('action')}
                    className="h-8 flex items-center gap-1"
                  >
                    Action <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>{formatDate(activity.created_at)}</TableCell>
                  <TableCell className="capitalize">
                    {activity.action.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell>{activity.details}</TableCell>
                  <TableCell className="font-mono">
                    {activity.ip_address || 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
              {filteredActivities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    {loading ? 'Loading activities...' : 'No activities found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}