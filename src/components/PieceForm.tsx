import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { Piece } from "@/types/optimizer";

interface PieceFormProps {
  pieces: Piece[];
  onAdd: (piece: Piece) => void;
  onRemove: (id: string) => void;
}

export function PieceForm({ pieces, onAdd, onRemove }: PieceFormProps) {
  const [label, setLabel] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [quantity, setQuantity] = useState("1");

  const handleAdd = () => {
    if (!label || !width || !height) return;
    
    onAdd({
      id: Date.now().toString(),
      label,
      width: parseFloat(width),
      height: parseFloat(height),
      quantity: parseInt(quantity) || 1,
    });
    
    setLabel("");
    setWidth("");
    setHeight("");
    setQuantity("1");
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Pieces to Cut</h2>
      
      <div className="grid gap-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="piece-label">Label</Label>
            <Input
              id="piece-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Window A"
            />
          </div>
          <div>
            <Label htmlFor="piece-width">Width (mm)</Label>
            <Input
              id="piece-width"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="500"
            />
          </div>
          <div>
            <Label htmlFor="piece-height">Height (mm)</Label>
            <Input
              id="piece-height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="800"
            />
          </div>
          <div>
            <Label htmlFor="piece-quantity">Quantity</Label>
            <Input
              id="piece-quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
            />
          </div>
        </div>
        <Button onClick={handleAdd} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Piece
        </Button>
      </div>

      {pieces.length > 0 && (
        <div className="space-y-2">
          {pieces.map((piece) => (
            <div
              key={piece.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex-1">
                <span className="font-medium">{piece.label}</span>
                <span className="text-muted-foreground ml-3">
                  {piece.width} × {piece.height} mm
                </span>
                <span className="text-muted-foreground ml-3">Qty: {piece.quantity}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(piece.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
