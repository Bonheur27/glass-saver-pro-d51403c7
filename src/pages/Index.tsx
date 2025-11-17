import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StockSheetForm } from "@/components/StockSheetForm";
import { PieceForm } from "@/components/PieceForm";
import { OptimizationResults } from "@/components/OptimizationResults";
import { StockSheet, Piece, OptimizationResult, RemainingPiece } from "@/types/optimizer";
import { optimizeCutting } from "@/utils/optimizer";
import { toast } from "sonner";
import { Sparkles, Github } from "lucide-react";

const Index = () => {
  const [sheets, setSheets] = useState<StockSheet[]>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

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
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </Button>
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
    </div>
  );
};

export default Index;
