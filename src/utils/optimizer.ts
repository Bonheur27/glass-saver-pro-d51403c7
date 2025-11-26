import { StockSheet, Piece, PlacedPiece, SheetLayout, OptimizationResult } from "@/types/optimizer";

// Enhanced bin packing algorithm with rotation support
export function optimizeCutting(
  stockSheets: StockSheet[],
  pieces: Piece[]
): OptimizationResult {
  const layouts: SheetLayout[] = [];
  
  // Expand pieces by quantity
  const expandedPieces: Piece[] = [];
  pieces.forEach(piece => {
    for (let i = 0; i < piece.quantity; i++) {
      expandedPieces.push({ ...piece, id: `${piece.id}-${i}`, quantity: 1 });
    }
  });
  
  // Sort pieces by area (largest first) for better packing
  expandedPieces.sort((a, b) => (b.width * b.height) - (a.width * a.height));
  
  // Track which pieces have been placed
  const piecesPlaced = new Set<string>();
  
  // Expand stock sheets by quantity to have individual sheets to work with
  const expandedSheets: (StockSheet & { sheetNum: number })[] = [];
  stockSheets.forEach(sheet => {
    for (let i = 0; i < sheet.quantity; i++) {
      expandedSheets.push({ 
        ...sheet, 
        id: `${sheet.id}-${i}`,
        sheetNum: i,
        quantity: 1 
      });
    }
  });
  
  // Process each expanded sheet
  for (const sheet of expandedSheets) {
    // Get remaining pieces that haven't been placed yet
    const remainingPieces = expandedPieces.filter(p => !piecesPlaced.has(p.id));
    
    if (remainingPieces.length === 0) break;
    
    const placedPieces: PlacedPiece[] = [];
    const occupiedSpaces: { x: number; y: number; width: number; height: number }[] = [];
    
    // Use greedy best-fit algorithm: repeatedly find the best piece that fits
    let foundPlacement = true;
    while (foundPlacement && remainingPieces.length > 0) {
      foundPlacement = false;
      let bestPlacement: PlacedPiece | null = null;
      let bestPieceIndex = -1;
      let bestScore = -1;
      
      // Check all remaining pieces to find the best fit
      for (let i = 0; i < remainingPieces.length; i++) {
        const piece = remainingPieces[i];
        if (piecesPlaced.has(piece.id)) continue;
        
        const placement = findBestPlacement(sheet, piece, occupiedSpaces);
        
        if (placement) {
          // Score based on area utilization and position (prefer bottom-left)
          const pieceArea = (placement.rotated ? piece.height : piece.width) * 
                           (placement.rotated ? piece.width : piece.height);
          const positionScore = 1000000 - (placement.x + placement.y); // Prefer bottom-left
          const score = pieceArea * 1000 + positionScore;
          
          if (score > bestScore) {
            bestScore = score;
            bestPlacement = placement;
            bestPieceIndex = i;
          }
        }
      }
      
      // Place the best piece found
      if (bestPlacement && bestPieceIndex >= 0) {
        const piece = remainingPieces[bestPieceIndex];
        placedPieces.push(bestPlacement);
        
        // Add kerf compensation to occupied space
        const kerf = sheet.kerf || 0;
        const pieceWidth = bestPlacement.rotated ? piece.height : piece.width;
        const pieceHeight = bestPlacement.rotated ? piece.width : piece.height;
        
        occupiedSpaces.push({
          x: bestPlacement.x,
          y: bestPlacement.y,
          width: pieceWidth + kerf,
          height: pieceHeight + kerf,
        });
        piecesPlaced.add(piece.id);
        foundPlacement = true;
      }
    }
    
    // Only create a layout if pieces were placed
    if (placedPieces.length > 0) {
      const usedArea = placedPieces.reduce((sum, pp) => {
        const w = pp.rotated ? pp.piece.height : pp.piece.width;
        const h = pp.rotated ? pp.piece.width : pp.piece.height;
        return sum + (w * h);
      }, 0);
      const sheetArea = sheet.width * sheet.height;
      const wastePercentage = ((sheetArea - usedArea) / sheetArea) * 100;
      
      // Calculate remaining usable pieces from empty spaces
      const remainingPieces = calculateRemainingPieces(
        sheet,
        occupiedSpaces,
        sheet.id
      );
      
      layouts.push({
        sheet,
        placedPieces,
        wastePercentage,
        remainingPieces,
      });
    }
  }
  
  const totalSheets = layouts.length;
  const totalWaste = layouts.reduce((sum, l) => sum + l.wastePercentage, 0) / totalSheets || 0;
  const efficiency = 100 - totalWaste;
  
  // Check if all pieces were placed
  const unplacedCount = expandedPieces.length - piecesPlaced.size;
  if (unplacedCount > 0) {
    console.warn(`Warning: ${unplacedCount} piece(s) could not be placed. You may need larger or more stock sheets.`);
  }
  
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
      // Validate piece stays within sheet boundaries
      if (pos.x + pos.width > sheet.width || pos.y + pos.height > sheet.height) {
        continue;
      }
      
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
  
  // Generate positions at corners and edges of each occupied space
  for (const occupied of occupiedSpaces) {
    // Right edge (aligned with bottom)
    if (occupied.x + occupied.width + orientation.width <= sheet.width) {
      positions.push({
        x: occupied.x + occupied.width,
        y: occupied.y,
        width: orientation.width,
        height: orientation.height,
      });
    }
    
    // Top edge (aligned with left)
    if (occupied.y + occupied.height + orientation.height <= sheet.height) {
      positions.push({
        x: occupied.x,
        y: occupied.y + occupied.height,
        width: orientation.width,
        height: orientation.height,
      });
    }
    
    // Top-right corner
    if (occupied.x + occupied.width + orientation.width <= sheet.width &&
        occupied.y + occupied.height + orientation.height <= sheet.height) {
      positions.push({
        x: occupied.x + occupied.width,
        y: occupied.y + occupied.height,
        width: orientation.width,
        height: orientation.height,
      });
    }
    
    // Right edge (aligned with top)
    if (occupied.x + occupied.width + orientation.width <= sheet.width &&
        occupied.y + occupied.height >= orientation.height) {
      positions.push({
        x: occupied.x + occupied.width,
        y: occupied.y + occupied.height - orientation.height,
        width: orientation.width,
        height: orientation.height,
      });
    }
    
    // Top edge (aligned with right)
    if (occupied.x + occupied.width >= orientation.width &&
        occupied.y + occupied.height + orientation.height <= sheet.height) {
      positions.push({
        x: occupied.x + occupied.width - orientation.width,
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

function calculateRemainingPieces(
  sheet: StockSheet,
  occupiedSpaces: { x: number; y: number; width: number; height: number }[],
  sheetLabel: string
) {
  const remainingPieces: { id: string; width: number; height: number; x: number; y: number; sheetLabel: string }[] = [];
  const minUsableSize = 100; // Minimum size in mm to consider a piece usable
  
  // Create a grid to track free spaces
  const gridSize = 10; // Resolution for finding free spaces
  const gridWidth = Math.ceil(sheet.width / gridSize);
  const gridHeight = Math.ceil(sheet.height / gridSize);
  const grid: boolean[][] = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(false));
  
  // Mark occupied spaces on grid
  for (const occupied of occupiedSpaces) {
    const startX = Math.floor(occupied.x / gridSize);
    const startY = Math.floor(occupied.y / gridSize);
    const endX = Math.min(Math.ceil((occupied.x + occupied.width) / gridSize), gridWidth);
    const endY = Math.min(Math.ceil((occupied.y + occupied.height) / gridSize), gridHeight);
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        if (y < gridHeight && x < gridWidth) {
          grid[y][x] = true;
        }
      }
    }
  }
  
  // Find rectangular free spaces
  const visited: boolean[][] = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(false));
  
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (!grid[y][x] && !visited[y][x]) {
        // Found a free cell, try to expand it into a rectangle
        let width = 0;
        let height = 0;
        
        // Find maximum width from this point
        while (x + width < gridWidth && !grid[y][x + width] && !visited[y][x + width]) {
          width++;
        }
        
        // Find maximum height that maintains the width
        let canExpand = true;
        while (canExpand && y + height < gridHeight) {
          for (let i = 0; i < width; i++) {
            if (x + i >= gridWidth || grid[y + height][x + i] || visited[y + height][x + i]) {
              canExpand = false;
              break;
            }
          }
          if (canExpand) height++;
        }
        
        const actualWidth = width * gridSize;
        const actualHeight = height * gridSize;
        
        // Only add if it's a usable size
        if (actualWidth >= minUsableSize && actualHeight >= minUsableSize) {
          remainingPieces.push({
            id: `remaining-${sheetLabel}-${remainingPieces.length}`,
            width: actualWidth,
            height: actualHeight,
            x: x * gridSize,
            y: y * gridSize,
            sheetLabel,
          });
        }
        
        // Mark as visited
        for (let dy = 0; dy < height; dy++) {
          for (let dx = 0; dx < width; dx++) {
            if (y + dy < gridHeight && x + dx < gridWidth) {
              visited[y + dy][x + dx] = true;
            }
          }
        }
      }
    }
  }
  
  return remainingPieces;
}
