import { OptimizationResult } from "@/types/optimizer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CuttingLayout } from "./CuttingLayout";
import { RemainingPieces } from "./RemainingPieces";
import { TrendingUp, Scissors, Layers, FileDown } from "lucide-react";
import { RemainingPiece } from "@/types/optimizer";
import { exportResultsToPDF } from "@/utils/exportPDF";
import { toast } from "sonner";

interface OptimizationResultsProps {
  result: OptimizationResult;
  onAddRemainingToStock: (pieces: RemainingPiece[]) => void;
}

export function OptimizationResults({ result, onAddRemainingToStock }: OptimizationResultsProps) {
  // Collect all remaining pieces from all layouts
  const allRemainingPieces = result.layouts.flatMap((layout) => layout.remainingPieces);

  const handleExportPDF = () => {
    try {
      exportResultsToPDF(result);
      toast.success("PDF report exported successfully!");
    } catch (error) {
      toast.error("Failed to export PDF report");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Optimization Results</h2>
          <Button onClick={handleExportPDF} variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF Report
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sheets</p>
              <p className="text-2xl font-bold">{result.totalSheets}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Efficiency</p>
              <p className="text-2xl font-bold text-success">
                {result.efficiency.toFixed(1)}%
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning/20 rounded-lg">
              <Scissors className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Waste</p>
              <p className="text-2xl font-bold text-warning">
                {result.totalWaste.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </Card>

      <RemainingPieces 
        remainingPieces={allRemainingPieces}
        onAddToStock={onAddRemainingToStock}
      />

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Cutting Layouts</h3>
        {result.layouts.map((layout, index) => (
          <CuttingLayout key={index} layout={layout} index={index} />
        ))}
      </div>
    </div>
  );
}
