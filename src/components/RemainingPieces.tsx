import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RemainingPiece } from "@/types/optimizer";
import { Package, Plus } from "lucide-react";
import { toast } from "sonner";

interface RemainingPiecesProps {
  remainingPieces: RemainingPiece[];
  onAddToStock: (pieces: RemainingPiece[]) => void;
}

export function RemainingPieces({ remainingPieces, onAddToStock }: RemainingPiecesProps) {
  const [selectedPieces, setSelectedPieces] = useState<Set<string>>(new Set());

  if (remainingPieces.length === 0) {
    return null;
  }

  const togglePiece = (id: string) => {
    const newSelected = new Set(selectedPieces);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPieces(newSelected);
  };

  const handleAddToStock = () => {
    const piecesToAdd = remainingPieces.filter((p) => selectedPieces.has(p.id));
    if (piecesToAdd.length === 0) {
      toast.error("Please select at least one piece to add to stock");
      return;
    }
    onAddToStock(piecesToAdd);
    setSelectedPieces(new Set());
    toast.success(`Added ${piecesToAdd.length} piece(s) to stock for future use`);
  };

  const totalArea = remainingPieces.reduce((sum, p) => sum + (p.width * p.height), 0);

  return (
    <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/20 rounded-lg">
            <Package className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Remaining Usable Pieces</h3>
            <p className="text-sm text-muted-foreground">
              {remainingPieces.length} piece(s) • {(totalArea / 1000000).toFixed(2)} m² total
            </p>
          </div>
        </div>
        <Button
          onClick={handleAddToStock}
          disabled={selectedPieces.size === 0}
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Selected to Stock ({selectedPieces.size})
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {remainingPieces.map((piece) => {
          const isSelected = selectedPieces.has(piece.id);
          return (
            <button
              key={piece.id}
              onClick={() => togglePiece(piece.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    From: {piece.sheetLabel}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-primary-foreground"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold">
                  {piece.width} × {piece.height} mm
                </p>
                <p className="text-sm text-muted-foreground">
                  {((piece.width * piece.height) / 1000000).toFixed(2)} m²
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> Select usable remaining pieces to add them to your stock inventory for future projects. 
          This helps maximize material efficiency across multiple jobs.
        </p>
      </div>
    </Card>
  );
}
