import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Scissors, Layers, Package, Calendar, DollarSign, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { analyticsService, projectsService, Project } from "@/services/projects";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DashboardStats {
  totalProjects: number;
  totalSheetsUsed: number;
  averageEfficiency: number;
  recentProjects: Array<{
    id: number;
    name: string;
    updated_at: string;
    efficiency: number | null;
    sheets_used: number | null;
  }>;
}

interface TrendData {
  date: string;
  efficiency: number;
  waste: number;
  projects: number;
}

interface SummaryData {
  sheetUsage: Array<{ size: string; count: number }>;
  wasteDistribution: Array<{ range: string; count: number }>;
  monthlySummary: Array<{
    month: string;
    projects: number;
    sheets: number;
    avg_efficiency: number;
  }>;
}

const wasteColors: Record<string, string> = {
  "0-10%": "hsl(var(--success))",
  "10-20%": "hsl(var(--primary))",
  "20-30%": "hsl(var(--warning))",
  "30%+": "hsl(var(--destructive))",
};

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [statsData, trendsData, summaryData, projectsData] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getTrends(),
        analyticsService.getSummary(),
        projectsService.getAll(),
      ]);
      
      setDashboardStats(statsData);
      setTrends(trendsData.map((t: any) => ({
        date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        efficiency: Number(t.efficiency) || 0,
        waste: Number(t.waste) || 0,
        projects: t.projects,
      })));
      setSummary(summaryData);
      setProjects(projectsData);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  const handleProjectClick = (projectId: number) => {
    navigate(`/?project=${projectId}`);
  };

  if (!isAuthenticated) {
    return null;
  }

  const sheetUsageData = summary?.sheetUsage?.map(s => ({
    size: s.size,
    count: Number(s.count),
  })) || [];

  const wasteDistributionData = summary?.wasteDistribution?.map(w => ({
    name: w.range,
    value: Number(w.count),
    color: wasteColors[w.range] || "hsl(var(--muted))",
  })) || [];

  const monthlyStats = summary?.monthlySummary?.[0] || {
    projects: 0,
    sheets: 0,
    avg_efficiency: 0,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Overview of your cutting optimizations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={fetchDashboardData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Link to="/">
              <Button variant="outline">
                <Scissors className="mr-2 h-4 w-4" />
                New Optimization
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardStats?.totalProjects || 0}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sheets Used</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardStats?.totalSheetsUsed || 0}</div>
                  <p className="text-xs text-muted-foreground">Total sheets processed</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-success">
                    {(dashboardStats?.averageEfficiency || 0).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Across all projects</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{monthlyStats.projects || 0}</div>
                  <p className="text-xs text-muted-foreground">Projects completed</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="projects">Recent Projects</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Efficiency Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Efficiency Trend</CardTitle>
                  <CardDescription>Optimization efficiency over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : trends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="efficiency" stroke="hsl(var(--success))" strokeWidth={2} name="Efficiency %" />
                        <Line type="monotone" dataKey="waste" stroke="hsl(var(--warning))" strokeWidth={2} name="Waste %" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No trend data available yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sheet Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Sheet Usage by Size</CardTitle>
                  <CardDescription>Most commonly used sheet dimensions</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : sheetUsageData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={sheetUsageData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="size" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" name="Sheets Used" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No sheet usage data available yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Waste Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Waste Distribution</CardTitle>
                  <CardDescription>Projects categorized by waste percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : wasteDistributionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={wasteDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={100}
                          fill="hsl(var(--primary))"
                          dataKey="value"
                        >
                          {wasteDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No waste distribution data available yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Summary</CardTitle>
                  <CardDescription>Current month performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <>
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Projects Completed</span>
                        <span className="text-2xl font-bold">{monthlyStats.projects || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Sheets Used</span>
                        <span className="text-2xl font-bold">{monthlyStats.sheets || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Average Efficiency</span>
                        <span className="text-2xl font-bold text-success">
                          {(monthlyStats.avg_efficiency || 0).toFixed(1)}%
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Your latest cutting optimization projects</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.slice(0, 10).map((project) => (
                      <Card 
                        key={project.id} 
                        className="hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => handleProjectClick(project.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg">{project.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(project.updated_at).toLocaleDateString()}
                                </span>
                                {project.sheet_count !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <Layers className="h-3 w-3" />
                                    {project.sheet_count} sheets
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              {project.last_efficiency !== undefined && project.last_efficiency !== null ? (
                                <>
                                  <div className="text-2xl font-bold text-success">
                                    {Number(project.last_efficiency).toFixed(1)}%
                                  </div>
                                  <div className="text-sm text-muted-foreground">Efficiency</div>
                                </>
                              ) : (
                                <div className="text-sm text-muted-foreground">Not optimized yet</div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No projects yet</p>
                    <Link to="/">
                      <Button variant="outline" className="mt-4">
                        Create your first project
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-success/10 to-success/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    Best Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mb-2">Average efficiency:</p>
                      <p className="text-3xl font-bold text-success mb-1">
                        {(dashboardStats?.averageEfficiency || 0).toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Across all projects</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Most Used Size
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : sheetUsageData.length > 0 ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-2">Most frequently used sheet:</p>
                      <p className="text-3xl font-bold text-primary mb-1">{sheetUsageData[0]?.size || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">Used {sheetUsageData[0]?.count || 0} times</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No data available yet</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-warning" />
                    Total Sheets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mb-2">Sheets processed:</p>
                      <p className="text-3xl font-bold text-warning mb-1">
                        {dashboardStats?.totalSheetsUsed || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">All time</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-destructive" />
                    Projects Count
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mb-2">Total projects:</p>
                      <p className="text-3xl font-bold text-destructive mb-1">
                        {dashboardStats?.totalProjects || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Created</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Tips to improve your cutting efficiency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Try larger sheets for better efficiency</p>
                    <p className="text-sm text-muted-foreground">244x122 cm sheets typically show better efficiency than smaller sizes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-success/10">
                  <Package className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Batch similar projects together</p>
                    <p className="text-sm text-muted-foreground">Combining similar piece sizes can reduce waste by up to 8%</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10">
                  <Scissors className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium">Consider piece rotation</p>
                    <p className="text-sm text-muted-foreground">Allowing rotation can improve material utilization significantly</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
