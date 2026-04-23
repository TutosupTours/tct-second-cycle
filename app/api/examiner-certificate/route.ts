import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const examinerName = searchParams.get("name") || "Examinateur";
  const academicYear = searchParams.get("year") || "2025-2026";
  const totalSessions = searchParams.get("sessions") || "0";
  const totalHours = searchParams.get("hours") || "0";

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({
    x: 0,
    y: 780,
    width: 595,
    height: 62,
    color: rgb(0.80, 0.19, 0.16),
  });

  page.drawText("Attestation de participation", {
    x: 48,
    y: 804,
    size: 22,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("Tutorat Tours - Second Cycle", {
    x: 48,
    y: 740,
    size: 18,
    font: fontBold,
    color: rgb(0.17, 0.18, 0.29),
  });

  const lines = [
    `Nous attestons que ${examinerName} a participé aux sessions de formation du tutorat.`,
    `Année universitaire : ${academicYear}`,
    `Nombre de sessions : ${totalSessions}`,
    `Nombre total d'heures : ${totalHours}`,
    "",
    "Cette attestation est établie pour servir et valoir ce que de droit.",
  ];

  let y = 680;
  for (const line of lines) {
    page.drawText(line, {
      x: 48,
      y,
      size: 13,
      font,
      color: rgb(0.17, 0.18, 0.29),
    });
    y -= 32;
  }

  page.drawText("Signature direction / validation", {
    x: 48,
    y: 180,
    size: 12,
    font: fontBold,
    color: rgb(0.17, 0.18, 0.29),
  });

  page.drawLine({
    start: { x: 48, y: 150 },
    end: { x: 260, y: 150 },
    thickness: 1,
    color: rgb(0.6, 0.6, 0.6),
  });

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="attestation-${examinerName}.pdf"`,
    },
  });
}