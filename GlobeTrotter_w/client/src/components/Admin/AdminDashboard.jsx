import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUserStats, useTripStats } from '@/hooks/react-query/use-admin';
import UserManagement from './UserManagement';
import AdminAnalytics from './AdminAnalytics';
import { Users, MapPin, Activity, DollarSign } from 'lucide-react';

const StatCard = ({ title, value, description, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const { data: userStats, isLoading: userStatsLoading } = useUserStats();
  const { data: tripStats, isLoading: tripStatsLoading } = useTripStats();

  console.log(userStats, tripStats);
  if (userStatsLoading || tripStatsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users and view platform analytics
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={userStats?.totalUsers || 0}
          description={`${userStats?.recentSignups || 0} new this month`}
          icon={Users}
        />
        <StatCard
          title="Total Trips"
          value={tripStats?.totalTrips || 0}
          description={`${tripStats?.averageTripsPerUser?.toFixed(1) || 0} per user`}
          icon={MapPin}
        />
        <StatCard
          title="Activities"
          value={tripStats?.totalActivities || 0}
          description="Across all trips"
          icon={Activity}
        />
        <StatCard
          title="Total Expenses"
          value={`$${tripStats?.totalExpenses?.toLocaleString() || 0}`}
          description="From all activities"
          icon={DollarSign}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <AdminAnalytics userStats={userStats} tripStats={tripStats} />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
