import { SheetLayout } from "@/types/optimizer";
import { Card } from "@/components/ui/card";

interface CuttingLayoutProps {
  layout: SheetLayout;
  index: number;
}

export function CuttingLayout({ layout, index }: CuttingLayoutProps) {
  const scale = 0.3; // Scale factor for visualization
  const padding = 20;
  
  const canvasWidth = layout.sheet.width * scale + padding * 2;
  const canvasHeight = layout.sheet.height * scale + padding * 2;
  
  // Generate distinct colors for pieces
  const getColor = (index: number) => {
    const colors = [
      "hsl(186, 85%, 45%)",
      "hsl(142, 76%, 36%)",
      "hsl(38, 92%, 50%)",
      "hsl(280, 65%, 60%)",
      "hsl(10, 80%, 55%)",
      "hsl(200, 75%, 50%)",
    ];
    return colors[index % colors.length];
  };

  const remainingColor = "hsl(var(--muted-foreground))";

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          Sheet {index + 1}: {layout.sheet.label}
        </h3>
        <p className="text-sm text-muted-foreground">
          {layout.sheet.width} × {layout.sheet.height} mm
        </p>
        <div className="flex flex-wrap gap-4 mt-2">
          <span className="text-sm">
            Pieces: <span className="font-medium">{layout.placedPieces.length}</span>
          </span>
          <span className="text-sm">
            Scrap: <span className="font-medium">{layout.remainingPieces.length}</span>
          </span>
          <span className="text-sm">
            Waste:{" "}
            <span
              className={`font-medium ${
                layout.wastePercentage < 15 ? "text-success" : 
                layout.wastePercentage < 30 ? "text-warning" : "text-destructive"
              }`}
            >
              {layout.wastePercentage.toFixed(1)}%
            </span>
          </span>
        </div>
      </div>
      
      <div className="mb-3 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary rounded" />
          <span>Cut pieces</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-muted-foreground border-dashed bg-muted/30 rounded" />
          <span>Remaining scrap</span>
        </div>
      </div>
      
      <div className="overflow-auto">
        <svg
          width={canvasWidth}
          height={canvasHeight}
          className="border border-border rounded-lg bg-card"
        >
          {/* Sheet outline */}
          <rect
            x={padding}
            y={padding}
            width={layout.sheet.width * scale}
            height={layout.sheet.height * scale}
            fill="hsl(var(--background))"
            stroke="hsl(var(--border))"
            strokeWidth="2"
          />
          
          {/* Placed pieces */}
          {layout.placedPieces.map((placed, idx) => {
            const width = placed.rotated ? placed.piece.height : placed.piece.width;
            const height = placed.rotated ? placed.piece.width : placed.piece.height;
            
            return (
              <g key={`placed-${idx}`}>
                <rect
                  x={padding + placed.x * scale}
                  y={padding + placed.y * scale}
                  width={width * scale}
                  height={height * scale}
                  fill={getColor(idx)}
                  fillOpacity="0.7"
                  stroke={getColor(idx)}
                  strokeWidth="2"
                />
                <text
                  x={padding + (placed.x + width / 2) * scale}
                  y={padding + (placed.y + height / 2) * scale}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="600"
                >
                  {placed.piece.label}
                  {placed.rotated && " ↻"}
                </text>
                <text
                  x={padding + (placed.x + width / 2) * scale}
                  y={padding + (placed.y + height / 2) * scale + 15}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="10"
                >
                  {width}×{height}
                </text>
              </g>
            );
          })}
          
          {/* Remaining pieces (scrap) */}
          <defs>
            <pattern
              id={`diagonalHatch-${index}`}
              patternUnits="userSpaceOnUse"
              width="8"
              height="8"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="8"
                stroke={remainingColor}
                strokeWidth="1.5"
                opacity="0.3"
              />
            </pattern>
          </defs>
          
          {layout.remainingPieces.map((remaining, idx) => (
            <g key={`remaining-${idx}`}>
              <rect
                x={padding + remaining.x * scale}
                y={padding + remaining.y * scale}
                width={remaining.width * scale}
                height={remaining.height * scale}
                fill={`url(#diagonalHatch-${index})`}
                stroke={remainingColor}
                strokeWidth="1.5"
                strokeDasharray="4,4"
                opacity="0.6"
              />
              <text
                x={padding + (remaining.x + remaining.width / 2) * scale}
                y={padding + (remaining.y + remaining.height / 2) * scale - 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={remainingColor}
                fontSize="10"
                fontWeight="600"
              >
                SCRAP
              </text>
              <text
                x={padding + (remaining.x + remaining.width / 2) * scale}
                y={padding + (remaining.y + remaining.height / 2) * scale + 5}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={remainingColor}
                fontSize="9"
              >
                {remaining.width}×{remaining.height}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </Card>
  );
}
