import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { getAnalytics, getSessions, getBugs } from "../lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";

const COLORS = ['#394273', '#5F6873', '#152340', '#7c88a0', '#4a5568'];

export function Dashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const data = await getAnalytics();
      setAnalytics(data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-none shadow-md">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader>
            <CardTitle className="text-red-900">Error Loading Analytics</CardTitle>
            <CardDescription className="text-red-700">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { totalPrompts, failureRate, averageRatings, issueTypes, totalBugs, recentSessions } = analytics || {};

  // Prepare rating data for chart
  const ratingData = averageRatings ? [
    { name: 'Accuracy', value: averageRatings.accuracy },
    { name: 'Coherence', value: averageRatings.coherence },
    { name: 'Relevance', value: averageRatings.relevance },
    { name: 'Creativity', value: averageRatings.creativity },
    { name: 'Safety', value: averageRatings.safety },
  ] : [];

  // Prepare issue type data for pie chart
  const issueTypeData = issueTypes ? Object.entries(issueTypes).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  })) : [];

  const averageScore = ratingData.length > 0 
    ? ratingData.reduce((acc, item) => acc + item.value, 0) / ratingData.length 
    : 0;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-[#152340]">Total Tests</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#394273] to-[#5F6873] flex items-center justify-center shadow-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#152340]">{totalPrompts || 0}</div>
            <p className="text-xs text-[#5F6873] mt-1 font-medium">Prompt executions</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-[#152340]">Failure Rate</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#152340]">{failureRate?.toFixed(1) || 0}%</div>
            <p className="text-xs text-[#5F6873] mt-1 font-medium">
              {failureRate > 10 ? (
                <span className="text-red-600 flex items-center gap-1 font-semibold">
                  <TrendingUp className="h-3 w-3" /> Above threshold
                </span>
              ) : (
                <span className="text-green-600 flex items-center gap-1 font-semibold">
                  <TrendingDown className="h-3 w-3" /> Within target
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-[#152340]">Avg Quality Score</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#152340]">{averageScore.toFixed(1)}/5.0</div>
            <p className="text-xs text-[#5F6873] mt-1 font-medium">Across all metrics</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-[#152340]">Total Bugs</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#152340]">{totalBugs || 0}</div>
            <p className="text-xs text-[#5F6873] mt-1 font-medium">Reported issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Average Ratings Bar Chart */}
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-[#394273]/5 to-transparent">
            <CardTitle className="text-[#152340]">Average Quality Ratings</CardTitle>
            <CardDescription className="text-[#5F6873]">Performance across evaluation criteria</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {ratingData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e1e4e8" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#5F6873" />
                  <YAxis domain={[0, 5]} stroke="#5F6873" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#152340', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Bar dataKey="value" fill="#394273" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-[#5F6873]">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Issue Types Pie Chart */}
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-[#394273]/5 to-transparent">
            <CardTitle className="text-[#152340]">Issue Distribution</CardTitle>
            <CardDescription className="text-[#5F6873]">Bug categories breakdown</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {issueTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={issueTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {issueTypeData.map((entry, index) => (
                      <Cell key={`cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#152340', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-[#5F6873]">
                No bugs reported yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-[#394273]/5 to-transparent">
          <CardTitle className="text-[#152340]">Recent Test Sessions</CardTitle>
          <CardDescription className="text-[#5F6873]">Latest prompt evaluations</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {recentSessions && recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.slice(0, 5).map((session: any) => (
                <div key={session.id} className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    session.evaluation?.status === 'acceptable' ? 'bg-green-500 shadow-lg shadow-green-500/50' :
                    session.evaluation?.status === 'needs-improvement' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' :
                    session.evaluation?.status === 'failed' ? 'bg-red-500 shadow-lg shadow-red-500/50' :
                    'bg-gray-300'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#152340] truncate">
                      {session.prompt || 'No prompt'}
                    </p>
                    <p className="text-xs text-[#5F6873] mt-1 font-medium">
                      Model: {session.model || 'N/A'} • {new Date(session.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[#5F6873]">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#5F6873]">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No test sessions yet. Start testing to see activity here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}