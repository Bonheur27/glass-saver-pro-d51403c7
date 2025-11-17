import jsPDF from "jspdf";
import { OptimizationResult } from "@/types/optimizer";

export function exportResultsToPDF(result: OptimizationResult) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Title
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("Glass Cut Optimization Report", pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 15;

  // Summary section
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Summary", 20, yPosition);
  yPosition += 8;

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Total Sheets Used: ${result.totalSheets}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Efficiency: ${result.efficiency.toFixed(1)}%`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Average Waste: ${result.totalWaste.toFixed(1)}%`, 20, yPosition);
  yPosition += 12;

  // Layout details
  result.layouts.forEach((layout, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Sheet #${index + 1}: ${layout.sheet.label}`, 20, yPosition);
    yPosition += 6;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Dimensions: ${(layout.sheet.width / 10).toFixed(1)} × ${(layout.sheet.height / 10).toFixed(1)} cm`,
      20,
      yPosition
    );
    yPosition += 5;
    pdf.text(`Waste: ${layout.wastePercentage.toFixed(1)}%`, 20, yPosition);
    yPosition += 5;
    pdf.text(`Pieces Cut: ${layout.placedPieces.length}`, 20, yPosition);
    yPosition += 5;
    pdf.text(`Scrap Pieces: ${layout.remainingPieces.length}`, 20, yPosition);
    yPosition += 8;

    // Pieces list
    if (layout.placedPieces.length > 0) {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("Cut Pieces:", 25, yPosition);
      yPosition += 5;

      pdf.setFont("helvetica", "normal");
      layout.placedPieces.forEach((pp) => {
        const w = pp.rotated ? pp.piece.height : pp.piece.width;
        const h = pp.rotated ? pp.piece.width : pp.piece.height;
        const pieceText = `  • ${pp.piece.label}: ${(w / 10).toFixed(1)} × ${(h / 10).toFixed(1)} cm at (${(pp.x / 10).toFixed(1)}, ${(pp.y / 10).toFixed(1)}) ${pp.rotated ? "[Rotated]" : ""}`;
        
        // Check if we need a new page
        if (yPosition > pageHeight - 15) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.text(pieceText, 25, yPosition);
        yPosition += 5;
      });
    }

    // Remaining pieces
    if (layout.remainingPieces.length > 0) {
      yPosition += 3;
      
      // Check if we need a new page
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFont("helvetica", "bold");
      pdf.text("Remaining Scrap Pieces:", 25, yPosition);
      yPosition += 5;

      pdf.setFont("helvetica", "normal");
      layout.remainingPieces.forEach((rp) => {
        const scrapText = `  • ${(rp.width / 10).toFixed(1)} × ${(rp.height / 10).toFixed(1)} cm at (${(rp.x / 10).toFixed(1)}, ${(rp.y / 10).toFixed(1)})`;
        
        // Check if we need a new page
        if (yPosition > pageHeight - 15) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.text(scrapText, 25, yPosition);
        yPosition += 5;
      });
    }

    yPosition += 8;
  });

  // Footer on last page
  const timestamp = new Date().toLocaleString();
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "italic");
  pdf.text(`Generated on ${timestamp}`, pageWidth / 2, pageHeight - 10, { align: "center" });

  // Save the PDF
  pdf.save(`glass-cut-optimization-${Date.now()}.pdf`);
}
