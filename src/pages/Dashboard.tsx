import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Scissors, Layers, FileDown, Package, Calendar, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for demonstration
const mockProjects = [
  { id: "1", name: "Kitchen Cabinets", date: "2024-01-15", sheets: 12, efficiency: 87.5, waste: 12.5, status: "completed" },
  { id: "2", name: "Bedroom Wardrobes", date: "2024-01-14", sheets: 8, efficiency: 91.2, waste: 8.8, status: "completed" },
  { id: "3", name: "Office Partitions", date: "2024-01-12", sheets: 15, efficiency: 85.3, waste: 14.7, status: "completed" },
  { id: "4", name: "Bathroom Vanity", date: "2024-01-10", sheets: 5, efficiency: 89.7, waste: 10.3, status: "completed" },
];

const efficiencyTrend = [
  { date: "Jan 10", efficiency: 89.7, waste: 10.3 },
  { date: "Jan 12", efficiency: 85.3, waste: 14.7 },
  { date: "Jan 14", efficiency: 91.2, waste: 8.8 },
  { date: "Jan 15", efficiency: 87.5, waste: 12.5 },
];

const sheetUsageData = [
  { size: "244x122 cm", count: 18 },
  { size: "305x152 cm", count: 12 },
  { size: "183x122 cm", count: 8 },
  { size: "244x183 cm", count: 6 },
];

const wasteDistribution = [
  { name: "0-5%", value: 15, color: "hsl(var(--success))" },
  { name: "5-10%", value: 35, color: "hsl(var(--primary))" },
  { name: "10-15%", value: 30, color: "hsl(var(--warning))" },
  { name: "15%+", value: 20, color: "hsl(var(--destructive))" },
];

const monthlyStats = {
  totalProjects: 24,
  totalSheets: 320,
  avgEfficiency: 88.4,
  totalCost: 4800,
  savedCost: 650,
};

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Overview of your cutting optimizations</p>
          </div>
          <Link to="/">
            <Button variant="outline">
              <Scissors className="mr-2 h-4 w-4" />
              New Optimization
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyStats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sheets Used</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyStats.totalSheets}</div>
              <p className="text-xs text-muted-foreground">Total sheets processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{monthlyStats.avgEfficiency}%</div>
              <p className="text-xs text-muted-foreground">+2.3% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">${monthlyStats.savedCost}</div>
              <p className="text-xs text-muted-foreground">Saved from optimization</p>
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
                  <CardDescription>Optimization efficiency over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={efficiencyTrend}>
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
                </CardContent>
              </Card>

              {/* Sheet Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Sheet Usage by Size</CardTitle>
                  <CardDescription>Most commonly used sheet dimensions</CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              {/* Waste Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Waste Distribution</CardTitle>
                  <CardDescription>Projects categorized by waste percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={wasteDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                      >
                        {wasteDistribution.map((entry, index) => (
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
                </CardContent>
              </Card>

              {/* Monthly Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Summary</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Projects Completed</span>
                    <span className="text-2xl font-bold">{monthlyStats.totalProjects}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Material Cost</span>
                    <span className="text-2xl font-bold">${monthlyStats.totalCost}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Cost Saved</span>
                    <span className="text-2xl font-bold text-success">${monthlyStats.savedCost}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Waste Reduction</span>
                    <span className="text-2xl font-bold text-success">13.5%</span>
                  </div>
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
                <div className="space-y-4">
                  {mockProjects.map((project) => (
                    <Card key={project.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{project.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {project.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Layers className="h-3 w-3" />
                                {project.sheets} sheets
                              </span>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="text-2xl font-bold text-success">{project.efficiency}%</div>
                            <div className="text-sm text-muted-foreground">Efficiency</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                  <p className="text-sm text-muted-foreground mb-2">Highest efficiency achieved:</p>
                  <p className="text-3xl font-bold text-success mb-1">91.2%</p>
                  <p className="text-sm text-muted-foreground">Bedroom Wardrobes project</p>
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
                  <p className="text-sm text-muted-foreground mb-2">Most frequently used sheet:</p>
                  <p className="text-3xl font-bold text-primary mb-1">244x122 cm</p>
                  <p className="text-sm text-muted-foreground">Used in 18 projects</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scissors className="h-5 w-5 text-warning" />
                    Waste Reduction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">Average waste reduced by:</p>
                  <p className="text-3xl font-bold text-warning mb-1">13.5%</p>
                  <p className="text-sm text-muted-foreground">Compared to manual cutting</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-destructive" />
                    Cost Efficiency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">Material cost savings:</p>
                  <p className="text-3xl font-bold text-destructive mb-1">$650</p>
                  <p className="text-sm text-muted-foreground">Saved this month</p>
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
                    <p className="text-sm text-muted-foreground">244x122 cm sheets show 5% better efficiency than smaller sizes</p>
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
