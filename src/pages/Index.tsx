import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StockSheetForm } from "@/components/StockSheetForm";
import { PieceForm } from "@/components/PieceForm";
import { OptimizationResults } from "@/components/OptimizationResults";
import { StockSheet, Piece, OptimizationResult, RemainingPiece } from "@/types/optimizer";
import { optimizeCutting } from "@/utils/optimizer";
import { toast } from "sonner";
import { Sparkles, Github, LayoutDashboard, Save, LogIn, LogOut, FolderOpen, Loader2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { projectsService } from "@/services/projects";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [sheets, setSheets] = useState<StockSheet[]>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Project loading state
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Load project from URL parameter
  useEffect(() => {
    const projectId = searchParams.get("project");
    if (projectId && isAuthenticated) {
      loadProject(parseInt(projectId, 10));
    }
  }, [searchParams, isAuthenticated]);

  const loadProject = async (projectId: number) => {
    setIsLoadingProject(true);
    try {
      const project = await projectsService.getById(projectId);
      setSheets(project.stockSheets || []);
      setPieces(project.pieces || []);
      setResult(project.optimizationResult);
      setCurrentProjectId(projectId);
      setProjectName(project.name);
      setProjectDescription(project.description || "");
      toast.success(`Loaded project: ${project.name}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to load project");
      // Clear the project param if loading fails
      setSearchParams({});
    } finally {
      setIsLoadingProject(false);
    }
  };

  const handleOptimize = () => {
    if (sheets.length === 0) {
      toast.error("Please add at least one stock sheet");
      return;
    }
    if (pieces.length === 0) {
      toast.error("Please add at least one piece to cut");
      return;
    }

    setIsOptimizing(true);
    
    setTimeout(() => {
      const optimizationResult = optimizeCutting(sheets, pieces);
      setResult(optimizationResult);
      setIsOptimizing(false);
      
      const totalPiecesRequested = pieces.reduce((sum, p) => sum + p.quantity, 0);
      const totalPiecesPlaced = optimizationResult.layouts.reduce(
        (sum, layout) => sum + layout.placedPieces.length,
        0
      );
      const unplacedPieces = totalPiecesRequested - totalPiecesPlaced;
      
      if (optimizationResult.layouts.length === 0) {
        toast.error("Could not fit any pieces. All pieces are too large for the available sheets.");
      } else if (unplacedPieces > 0) {
        toast.warning(`Optimization complete! Using ${optimizationResult.totalSheets} sheets with ${optimizationResult.efficiency.toFixed(1)}% efficiency. ${unplacedPieces} piece(s) could not fit.`);
      } else {
        toast.success(`Optimization complete! Using ${optimizationResult.totalSheets} sheets with ${optimizationResult.efficiency.toFixed(1)}% efficiency.`);
      }
    }, 500);
  };

  const handleReset = () => {
    setResult(null);
  };

  const handleNewProject = () => {
    setSheets([]);
    setPieces([]);
    setResult(null);
    setCurrentProjectId(null);
    setProjectName("");
    setProjectDescription("");
    setSearchParams({});
    toast.info("Started new project");
  };

  const handleAddRemainingToStock = (remainingPieces: RemainingPiece[]) => {
    const newSheets: StockSheet[] = remainingPieces.map((piece) => ({
      id: `remaining-${Date.now()}-${Math.random()}`,
      label: `Scrap from ${piece.sheetLabel}`,
      width: piece.width,
      height: piece.height,
      quantity: 1,
    }));
    
    setSheets([...sheets, ...newSheets]);
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    setIsSaving(true);
    try {
      if (currentProjectId) {
        // Update existing project
        await projectsService.update(currentProjectId, {
          name: projectName,
          description: projectDescription,
          stockSheets: sheets,
          pieces: pieces,
          optimizationResult: result || undefined,
        });
        toast.success("Project updated successfully!");
      } else {
        // Create new project
        const response = await projectsService.create({
          name: projectName,
          description: projectDescription,
          stockSheets: sheets,
          pieces: pieces,
          optimizationResult: result || undefined,
        });
        setCurrentProjectId(response.id);
        setSearchParams({ project: response.id.toString() });
        toast.success("Project saved successfully!");
      }
      setShowSaveDialog(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save project");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClick = () => {
    if (!isAuthenticated) {
      toast.error("Please login to save projects");
      navigate("/auth");
      return;
    }

    if (sheets.length === 0 || pieces.length === 0) {
      toast.error("Add sheets and pieces before saving");
      return;
    }

    setShowSaveDialog(true);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  if (isLoadingProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32 mt-1" />
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {currentProjectId ? projectName : "Glass Cut Optimizer"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {currentProjectId ? "Editing project" : "Minimize waste, maximize efficiency"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {currentProjectId && (
                <Button variant="outline" size="sm" onClick={handleNewProject}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  New
                </Button>
              )}
              {isAuthenticated && (
                <>
                  <Button variant="outline" size="sm" onClick={handleSaveClick}>
                    <Save className="mr-2 h-4 w-4" />
                    {currentProjectId ? "Update" : "Save"}
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/projects">
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Projects
                    </Link>
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              {isAuthenticated ? (
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!result ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {currentProjectId ? `Editing: ${projectName}` : "Smart Cutting Optimization"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {currentProjectId 
                  ? "Modify your sheets and pieces, then re-optimize to see updated layouts."
                  : "Add your stock sheets and pieces, then let our advanced algorithm find the most efficient cutting layout with minimal waste."
                }
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <StockSheetForm
                sheets={sheets}
                onAdd={(sheet) => setSheets([...sheets, sheet])}
                onRemove={(id) => setSheets(sheets.filter((s) => s.id !== id))}
              />
              
              <PieceForm
                pieces={pieces}
                onAdd={(piece) => setPieces([...pieces, piece])}
                onRemove={(id) => setPieces(pieces.filter((p) => p.id !== id))}
              />
            </div>

            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={handleOptimize}
                disabled={isOptimizing || sheets.length === 0 || pieces.length === 0}
                className="min-w-[200px]"
              >
                {isOptimizing ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    {currentProjectId ? "Re-Optimize" : "Optimize Cutting"}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {currentProjectId ? `${projectName} - Optimized Layout` : "Your Optimized Layout"}
              </h2>
              <div className="flex gap-2">
                {isAuthenticated && (
                  <Button onClick={handleSaveClick} variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    {currentProjectId ? "Update" : "Save"}
                  </Button>
                )}
                <Button onClick={handleReset} variant="outline">
                  Edit Inputs
                </Button>
                <Button onClick={handleNewProject} variant="outline">
                  New Project
                </Button>
              </div>
            </div>
            
            <OptimizationResults 
              result={result} 
              onAddRemainingToStock={handleAddRemainingToStock}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with precision for glass cutting professionals</p>
        </div>
      </footer>

      {/* Save Project Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentProjectId ? "Update Project" : "Save Project"}</DialogTitle>
            <DialogDescription>
              {currentProjectId 
                ? "Update your project with the current changes."
                : "Give your optimization project a name to save it to your account."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., Kitchen Cabinet Doors"
              />
            </div>
            <div>
              <Label htmlFor="project-description">Description (Optional)</Label>
              <Textarea
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Add any notes about this project..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProject} disabled={isSaving}>
              {isSaving ? "Saving..." : currentProjectId ? "Update Project" : "Save Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
