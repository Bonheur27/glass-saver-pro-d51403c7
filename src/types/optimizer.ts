export interface StockSheet {
  id: string;
  width: number;
  height: number;
  label: string;
  quantity: number;
}

export interface Piece {
  id: string;
  width: number;
  height: number;
  label: string;
  quantity: number;
}

export interface PlacedPiece {
  piece: Piece;
  x: number;
  y: number;
  rotated: boolean;
}

export interface RemainingPiece {
  id: string;
  width: number;
  height: number;
  x: number;
  y: number;
  sheetLabel: string;
}

export interface SheetLayout {
  sheet: StockSheet;
  placedPieces: PlacedPiece[];
  wastePercentage: number;
  remainingPieces: RemainingPiece[];
}

export interface OptimizationResult {
  layouts: SheetLayout[];
  totalWaste: number;
  totalSheets: number;
  efficiency: number;
}
