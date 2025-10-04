import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export default function AdminAnalytics({ userStats, tripStats }) {
  // Pink-themed color palette to match website UI
  const COLORS = {
    primary: '#ec4899', // Pink-500
    secondary: '#f472b6', // Pink-400
    accent: '#be185d', // Pink-700
    rose: '#fb7185', // Rose-400
    fuchsia: '#e879f9', // Fuchsia-400
    purple: '#d946ef', // Fuchsia-500
    magenta: '#c026d3', // Fuchsia-600
    coral: '#fb7299', // Custom coral pink
    salmon: '#ff8fab', // Custom salmon pink
    blush: '#ffb3c1', // Custom blush pink
  };

  const PIE_COLORS = [
    '#ec4899',
    '#f472b6',
    '#be185d',
    '#fb7185',
    '#e879f9',
    '#d946ef',
    '#c026d3',
    '#fb7299',
    '#ff8fab',
    '#ffb3c1',
  ];

  // Chart configurations with pink-themed colors
  const monthlyTrendsConfig = {
    users: {
      label: 'New Users',
      color: COLORS.primary,
    },
    trips: {
      label: 'New Trips',
      color: COLORS.secondary,
    },
  };

  const userSignupsConfig = {
    users: {
      label: 'Users',
      color: COLORS.rose,
    },
  };

  const tripCreationConfig = {
    trips: {
      label: 'Trips',
      color: COLORS.fuchsia,
    },
  };

  const countryConfig = {
    users: {
      label: 'Users',
      color: COLORS.accent,
    },
  };

  // Process data for charts
  const processedUsersByMonth =
    userStats?.usersByMonth?.map((item) => ({
      month: new Date(item.month + '-01').toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      }),
      users: item.count,
    })) || [];

  const processedTripsByMonth =
    tripStats?.tripsByMonth?.map((item) => ({
      month: new Date(item.month + '-01').toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      }),
      trips: item.count,
    })) || [];

  // Combine monthly data for area chart
  const combinedMonthlyData = processedUsersByMonth.map((userItem) => {
    const tripItem = processedTripsByMonth.find(
      (t) => t.month === userItem.month,
    );
    return {
      month: userItem.month,
      users: userItem.users,
      trips: tripItem?.trips || 0,
    };
  });

  const processedCountryData =
    userStats?.usersByCountry?.slice(0, 8).map((item, index) => ({
      country: item.country,
      users: item.count,
      fill: PIE_COLORS[index % PIE_COLORS.length],
    })) || [];

  return (
    <div className="space-y-8">
      {/* Combined Monthly Trends - Area Chart */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Monthly Growth Trends</CardTitle>
          <CardDescription>
            User signups and trip creation trends over the last 12 months
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer
            config={monthlyTrendsConfig}
            className="h-[300px] w-full "
          >
            <AreaChart
              accessibilityLayer
              data={combinedMonthlyData}
              margin={{
                left: 12,
                right: 12,
                top: 20,
                bottom: 12,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(236, 72, 153, 0.1)' }}
                content={<ChartTooltipContent />}
              />
              <defs>
                <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={COLORS.primary}
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor={COLORS.primary}
                    stopOpacity={0.2}
                  />
                </linearGradient>
                <linearGradient id="fillTrips" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={COLORS.secondary}
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor={COLORS.secondary}
                    stopOpacity={0.2}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="users"
                type="natural"
                fill="url(#fillUsers)"
                fillOpacity={1}
                stroke={COLORS.primary}
                strokeWidth={3}
                stackId="a"
              />
              <Area
                dataKey="trips"
                type="natural"
                fill="url(#fillTrips)"
                fillOpacity={1}
                stroke={COLORS.secondary}
                strokeWidth={3}
                stackId="b"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Signups Bar Chart */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>User Signups by Month</CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={userSignupsConfig}>
              <BarChart accessibilityLayer data={processedUsersByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(251, 113, 133, 0.1)' }}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="users" fill={COLORS.rose} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Trip Creation Line Chart */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Trips Created by Month</CardTitle>
            <CardDescription>Trip creation activity over time</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={tripCreationConfig}>
              <LineChart
                accessibilityLayer
                data={processedTripsByMonth}
                margin={{
                  left: 12,
                  right: 12,
                  top: 20,
                  bottom: 12,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={{ stroke: COLORS.fuchsia, strokeWidth: 2 }}
                  content={<ChartTooltipContent />}
                />
                <Line
                  dataKey="trips"
                  type="monotone"
                  stroke={COLORS.fuchsia}
                  strokeWidth={4}
                  dot={{
                    fill: COLORS.fuchsia,
                    strokeWidth: 2,
                    r: 6,
                  }}
                  activeDot={{
                    r: 8,
                    fill: COLORS.purple,
                    stroke: COLORS.fuchsia,
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Users by Country Pie Chart */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Users by Country</CardTitle>
            <CardDescription>Geographic distribution of users</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer
              config={countryConfig}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={processedCountryData}
                  dataKey="users"
                  nameKey="country"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={45}
                  strokeWidth={3}
                  stroke="#ffffff"
                >
                  {processedCountryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      style={{
                        filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.1))',
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {processedCountryData.slice(0, 6).map((item) => (
                <div
                  key={item.country}
                  className="flex items-center gap-2 text-sm"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-gray-700">{item.country}</span>
                  <span className="text-gray-500 ml-auto">{item.users}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Platform Summary */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Platform Summary</CardTitle>
            <CardDescription>Key metrics and insights</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center rounded-xl p-4 bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200">
                <span className="text-3xl font-bold text-pink-600">
                  {userStats?.totalAdmins || 0}
                </span>
                <span className="text-sm font-medium text-pink-700">
                  Admin Users
                </span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl p-4 bg-gradient-to-br from-rose-50 to-rose-100 border-2 border-rose-200">
                <span className="text-3xl font-bold text-rose-600">
                  {userStats?.totalActiveUsers || 0}
                </span>
                <span className="text-sm font-medium text-rose-700">
                  Regular Users
                </span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl p-4 bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 border-2 border-fuchsia-200">
                <span className="text-3xl font-bold text-fuchsia-600">
                  {userStats?.recentSignups || 0}
                </span>
                <span className="text-sm font-medium text-fuchsia-700">
                  New (30d)
                </span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
                <span className="text-3xl font-bold text-purple-600">
                  {tripStats?.averageTripsPerUser?.toFixed(1) || '0.0'}
                </span>
                <span className="text-sm font-medium text-purple-700">
                  Avg Trips
                </span>
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200">
                <span className="text-sm font-semibold text-pink-700">
                  Total Expenses
                </span>
                <span className="text-lg font-bold text-pink-600">
                  ${tripStats?.totalExpenses?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-fuchsia-50 to-purple-50 border border-fuchsia-200">
                <span className="text-sm font-semibold text-fuchsia-700">
                  Total Activities
                </span>
                <span className="text-lg font-bold text-fuchsia-600">
                  {tripStats?.totalActivities?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200">
                <span className="text-sm font-semibold text-rose-700">
                  Countries Covered
                </span>
                <span className="text-lg font-bold text-rose-600">
                  {processedCountryData.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
