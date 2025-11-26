import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StockSheetForm } from "@/components/StockSheetForm";
import { PieceForm } from "@/components/PieceForm";
import { OptimizationResults } from "@/components/OptimizationResults";
import { StockSheet, Piece, OptimizationResult, RemainingPiece } from "@/types/optimizer";
import { optimizeCutting } from "@/utils/optimizer";
import { toast } from "sonner";
import { Sparkles, Github, LayoutDashboard, Save, LogIn, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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

const Index = () => {
  const [sheets, setSheets] = useState<StockSheet[]>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
    
    // Simulate processing time for better UX
    setTimeout(() => {
      const optimizationResult = optimizeCutting(sheets, pieces);
      setResult(optimizationResult);
      setIsOptimizing(false);
      
      // Calculate total pieces requested
      const totalPiecesRequested = pieces.reduce((sum, p) => sum + p.quantity, 0);
      const totalPiecesPlaced = optimizationResult.layouts.reduce(
        (sum, layout) => sum + layout.placedPieces.length,
        0
      );
      const unplacedPieces = totalPiecesRequested - totalPiecesPlaced;
      
      if (optimizationResult.layouts.length === 0) {
        toast.error("Could not fit any pieces. All pieces are too large for the available sheets.");
      } else if (unplacedPieces > 0) {
        toast.warning(`Optimization complete! Using ${optimizationResult.totalSheets} sheets with ${optimizationResult.efficiency.toFixed(1)}% efficiency. ${unplacedPieces} piece(s) could not fit - add more or larger sheets.`);
      } else {
        toast.success(`Optimization complete! Using ${optimizationResult.totalSheets} sheets with ${optimizationResult.efficiency.toFixed(1)}% efficiency. All pieces placed!`);
      }
    }, 500);
  };

  const handleReset = () => {
    setResult(null);
  };

  const handleAddRemainingToStock = (remainingPieces: RemainingPiece[]) => {
    // Convert remaining pieces to stock sheets
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
      await projectsService.create({
        name: projectName,
        description: projectDescription,
        stockSheets: sheets,
        pieces: pieces,
        optimizationResult: result || undefined,
      });

      toast.success("Project saved successfully!");
      setShowSaveDialog(false);
      setProjectName("");
      setProjectDescription("");
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
                <h1 className="text-2xl font-bold text-foreground">Glass Cut Optimizer</h1>
                <p className="text-sm text-muted-foreground">Minimize waste, maximize efficiency</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <Button variant="outline" size="sm" onClick={handleSaveClick}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Project
                </Button>
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
                Smart Cutting Optimization
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Add your stock sheets and pieces, then let our advanced algorithm find the most efficient cutting layout with minimal waste.
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
                    Optimize Cutting
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Optimized Layout</h2>
              <Button onClick={handleReset} variant="outline">
                Start New Optimization
              </Button>
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
            <DialogTitle>Save Project</DialogTitle>
            <DialogDescription>
              Give your optimization project a name to save it to your account.
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
              {isSaving ? "Saving..." : "Save Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
