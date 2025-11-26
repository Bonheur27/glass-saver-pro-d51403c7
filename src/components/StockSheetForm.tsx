import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { StockSheet } from "@/types/optimizer";

interface StockSheetFormProps {
  sheets: StockSheet[];
  onAdd: (sheet: StockSheet) => void;
  onRemove: (id: string) => void;
}

export function StockSheetForm({ sheets, onAdd, onRemove }: StockSheetFormProps) {
  const [label, setLabel] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [kerf, setKerf] = useState("3");

  const handleAdd = () => {
    if (!label || !width || !height) return;
    
    onAdd({
      id: Date.now().toString(),
      label,
      width: parseFloat(width) * 10, // Convert cm to mm
      height: parseFloat(height) * 10, // Convert cm to mm
      quantity: parseInt(quantity) || 1,
      kerf: parseFloat(kerf) || 0,
    });
    
    setLabel("");
    setWidth("");
    setHeight("");
    setQuantity("1");
    setKerf("3");
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Stock Sheets</h2>
      
      <div className="grid gap-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="sheet-label">Label</Label>
            <Input
              id="sheet-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Sheet A"
            />
          </div>
          <div>
            <Label htmlFor="sheet-width">Width (cm)</Label>
            <Input
              id="sheet-width"
              type="number"
              step="0.1"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="100"
            />
          </div>
          <div>
            <Label htmlFor="sheet-height">Height (cm)</Label>
            <Input
              id="sheet-height"
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="200"
            />
          </div>
          <div>
            <Label htmlFor="sheet-kerf">Kerf (mm)</Label>
            <Input
              id="sheet-kerf"
              type="number"
              step="0.1"
              value={kerf}
              onChange={(e) => setKerf(e.target.value)}
              placeholder="3"
            />
          </div>
          <div>
            <Label htmlFor="sheet-quantity">Quantity</Label>
            <Input
              id="sheet-quantity"
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
          Add Stock Sheet
        </Button>
      </div>

      {sheets.length > 0 && (
        <div className="space-y-2">
          {sheets.map((sheet) => (
            <div
              key={sheet.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex-1">
                <span className="font-medium">{sheet.label}</span>
                <span className="text-muted-foreground ml-3">
                  {(sheet.width / 10).toFixed(1)} × {(sheet.height / 10).toFixed(1)} cm
                </span>
                <span className="text-muted-foreground ml-3">Kerf: {sheet.kerf || 0}mm</span>
                <span className="text-muted-foreground ml-3">Qty: {sheet.quantity}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(sheet.id)}
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
