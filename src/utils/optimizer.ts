import { StockSheet, Piece, PlacedPiece, SheetLayout, OptimizationResult } from "@/types/optimizer";

// Enhanced bin packing algorithm with rotation support
export function optimizeCutting(
  stockSheets: StockSheet[],
  pieces: Piece[]
): OptimizationResult {
  const layouts: SheetLayout[] = [];
  let remainingPieces = [...pieces];
  
  // Expand pieces by quantity
  const expandedPieces: Piece[] = [];
  pieces.forEach(piece => {
    for (let i = 0; i < piece.quantity; i++) {
      expandedPieces.push({ ...piece, id: `${piece.id}-${i}` });
    }
  });
  
  // Sort pieces by area (largest first) for better packing
  expandedPieces.sort((a, b) => (b.width * b.height) - (a.width * a.height));
  
  let currentPieceIndex = 0;
  
  // Process each stock sheet type
  for (const sheet of stockSheets) {
    for (let sheetNum = 0; sheetNum < sheet.quantity; sheetNum++) {
      if (currentPieceIndex >= expandedPieces.length) break;
      
      const placedPieces: PlacedPiece[] = [];
      const occupiedSpaces: { x: number; y: number; width: number; height: number }[] = [];
      
      // Try to place as many pieces as possible on this sheet
      while (currentPieceIndex < expandedPieces.length) {
        const piece = expandedPieces[currentPieceIndex];
        const placement = findBestPlacement(sheet, piece, occupiedSpaces);
        
        if (placement) {
          placedPieces.push(placement);
          occupiedSpaces.push({
            x: placement.x,
            y: placement.y,
            width: placement.rotated ? piece.height : piece.width,
            height: placement.rotated ? piece.width : piece.height,
          });
          currentPieceIndex++;
        } else {
          break; // Can't fit any more pieces on this sheet
        }
      }
      
      if (placedPieces.length > 0) {
        const usedArea = placedPieces.reduce((sum, pp) => {
          const w = pp.rotated ? pp.piece.height : pp.piece.width;
          const h = pp.rotated ? pp.piece.width : pp.piece.height;
          return sum + (w * h);
        }, 0);
        const sheetArea = sheet.width * sheet.height;
        const wastePercentage = ((sheetArea - usedArea) / sheetArea) * 100;
        
        layouts.push({
          sheet: { ...sheet, id: `${sheet.id}-${sheetNum}` },
          placedPieces,
          wastePercentage,
        });
      }
      
      if (currentPieceIndex >= expandedPieces.length) break;
    }
    
    if (currentPieceIndex >= expandedPieces.length) break;
  }
  
  const totalSheets = layouts.length;
  const totalWaste = layouts.reduce((sum, l) => sum + l.wastePercentage, 0) / totalSheets || 0;
  const efficiency = 100 - totalWaste;
  
  return {
    layouts,
    totalWaste,
    totalSheets,
    efficiency,
  };
}

function findBestPlacement(
  sheet: StockSheet,
  piece: Piece,
  occupiedSpaces: { x: number; y: number; width: number; height: number }[]
): PlacedPiece | null {
  // Try both orientations
  const orientations = [
    { width: piece.width, height: piece.height, rotated: false },
    { width: piece.height, height: piece.width, rotated: true },
  ];
  
  for (const orientation of orientations) {
    // Check if piece fits in the sheet
    if (orientation.width > sheet.width || orientation.height > sheet.height) {
      continue;
    }
    
    // Try to find a position using Bottom-Left algorithm
    const positions = generateCandidatePositions(sheet, orientation, occupiedSpaces);
    
    for (const pos of positions) {
      if (!hasOverlap(pos, occupiedSpaces)) {
        return {
          piece,
          x: pos.x,
          y: pos.y,
          rotated: orientation.rotated,
        };
      }
    }
  }
  
  return null;
}

function generateCandidatePositions(
  sheet: StockSheet,
  orientation: { width: number; height: number },
  occupiedSpaces: { x: number; y: number; width: number; height: number }[]
) {
  const positions: { x: number; y: number; width: number; height: number }[] = [];
  
  // Always try bottom-left corner first
  positions.push({ x: 0, y: 0, width: orientation.width, height: orientation.height });
  
  // Generate positions at the top-right corner of each occupied space
  for (const occupied of occupiedSpaces) {
    // Right edge
    if (occupied.x + occupied.width + orientation.width <= sheet.width) {
      positions.push({
        x: occupied.x + occupied.width,
        y: occupied.y,
        width: orientation.width,
        height: orientation.height,
      });
    }
    
    // Top edge
    if (occupied.y + occupied.height + orientation.height <= sheet.height) {
      positions.push({
        x: occupied.x,
        y: occupied.y + occupied.height,
        width: orientation.width,
        height: orientation.height,
      });
    }
  }
  
  // Sort by y first (bottom-left heuristic), then by x
  positions.sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });
  
  return positions;
}

function hasOverlap(
  rect: { x: number; y: number; width: number; height: number },
  occupiedSpaces: { x: number; y: number; width: number; height: number }[]
): boolean {
  for (const occupied of occupiedSpaces) {
    if (
      rect.x < occupied.x + occupied.width &&
      rect.x + rect.width > occupied.x &&
      rect.y < occupied.y + occupied.height &&
      rect.y + rect.height > occupied.y
    ) {
      return true;
    }
  }
  return false;
}
