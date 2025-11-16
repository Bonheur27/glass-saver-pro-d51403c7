import { OptimizationResult } from "@/types/optimizer";
import { Card } from "@/components/ui/card";
import { CuttingLayout } from "./CuttingLayout";
import { TrendingUp, Scissors, Layers } from "lucide-react";

interface OptimizationResultsProps {
  result: OptimizationResult;
}

export function OptimizationResults({ result }: OptimizationResultsProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Optimization Results</h2>
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

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Cutting Layouts</h3>
        {result.layouts.map((layout, index) => (
          <CuttingLayout key={index} layout={layout} index={index} />
        ))}
      </div>
    </div>
  );
}
