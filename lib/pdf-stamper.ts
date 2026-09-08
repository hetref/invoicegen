import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

export interface StampOptions {
  pdfBuffer: Uint8Array | Buffer<any> | ArrayBuffer;
  displayName?: string | null;
  invoiceDate?: string | null;
  paidAt?: string | null;
  stampAllPages?: boolean;
}

/**
 * Sanitizes strings for standard PDF Helvetica font (Latin-1/WinAnsi encoding safe).
 */
function sanitizePdfText(str: string): string {
  return str.replace(/[^\x20-\x7E\xA0-\xFF]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Mathematically rotates a local 2D point (lx, ly) around origin (ox, oy) by angleInDegrees.
 */
function rotatePoint(
  ox: number,
  oy: number,
  lx: number,
  ly: number,
  angleInDegrees: number
): { x: number; y: number } {
  const rad = (angleInDegrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: ox + lx * cos - ly * sin,
    y: oy + lx * sin + ly * cos,
  };
}

/**
 * Stamps an authentic, translucent PAID stamp onto a PDF document.
 * Displays the user's capitalized display name from /profile, PAID in center,
 * and the exact invoice date for SETTLED.
 * Returns the modified PDF as a Buffer.
 */
export async function stampPdfWithPaid({
  pdfBuffer,
  displayName,
  invoiceDate,
  paidAt,
  stampAllPages = false,
}: StampOptions): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  if (pages.length === 0) {
    return pdfBuffer as any;
  }

  // Embed standard Helvetica fonts
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Palette: Verified emerald theme
  const strokeColor = rgb(4 / 255, 120 / 255, 87 / 255); // #047857
  const fillColor = rgb(16 / 255, 185 / 255, 129 / 255); // #10B981
  const textColor = rgb(5 / 255, 150 / 255, 105 / 255); // #059669
  const stampOpacity = 0.88;
  const bgOpacity = 0.08;

  // Stamp dimensions in points (1 pt = 1/72 inch)
  const stampWidth = 148;
  const stampHeight = 66;
  const angle = -12; // tilted stamp look

  // Format top display name (capitalized from /profile)
  const cleanDisplayName = sanitizePdfText((displayName || "").trim().toUpperCase());
  const topText = cleanDisplayName || "VERIFIED";

  // Format date text safely using the invoice date
  let rawDate = sanitizePdfText((invoiceDate || "").trim());
  if (!rawDate && paidAt) {
    rawDate = sanitizePdfText(paidAt.trim());
  }
  if (/^\d{4}-\d{2}-\d{2}T/.test(rawDate)) {
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        rawDate = d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
      }
    } catch {
      // keep
    }
  }
  const dateText = rawDate ? `SETTLED • ${rawDate}` : "SETTLED IN FULL";

  // Apply stamp to first page (or all pages if requested)
  const targetPages = stampAllPages ? pages : [pages[0]];

  for (const page of targetPages) {
    const { width: pageWidth, height: pageHeight } = page.getSize();

    // Position in the top-right header area of the invoice
    const originX = pageWidth - stampWidth - 42;
    const originY = pageHeight - stampHeight - 48;

    // 1. Outer filled translucent background box
    page.drawRectangle({
      x: originX,
      y: originY,
      width: stampWidth,
      height: stampHeight,
      rotate: degrees(angle),
      color: fillColor,
      opacity: bgOpacity,
    });

    // 2. Outer double border (thick primary border)
    page.drawRectangle({
      x: originX,
      y: originY,
      width: stampWidth,
      height: stampHeight,
      rotate: degrees(angle),
      borderColor: strokeColor,
      borderWidth: 2.5,
      borderOpacity: stampOpacity,
    });

    // 3. Inner border (inset by 3.5 pt)
    const inset = 3.5;
    const innerOrigin = rotatePoint(originX, originY, inset, inset, angle);
    page.drawRectangle({
      x: innerOrigin.x,
      y: innerOrigin.y,
      width: stampWidth - inset * 2,
      height: stampHeight - inset * 2,
      rotate: degrees(angle),
      borderColor: strokeColor,
      borderWidth: 1,
      borderOpacity: stampOpacity,
    });

    // 4. Top Banner Divider Line
    const topDivY = stampHeight - 17;
    const topDivStart = rotatePoint(originX, originY, inset, topDivY, angle);
    const topDivEnd = rotatePoint(originX, originY, stampWidth - inset, topDivY, angle);
    page.drawLine({
      start: topDivStart,
      end: topDivEnd,
      thickness: 0.8,
      color: strokeColor,
      opacity: stampOpacity,
    });

    // 5. Top Banner Text: Capitalized Profile Display Name
    let topFontSize = 8;
    while (topFontSize > 4.5 && fontBold.widthOfTextAtSize(topText, topFontSize) > stampWidth - 14) {
      topFontSize -= 0.5;
    }
    const topTextWidth = fontBold.widthOfTextAtSize(topText, topFontSize);
    const topTextLocalX = (stampWidth - topTextWidth) / 2;
    const topTextLocalY = stampHeight - 12.5;
    const topTextPos = rotatePoint(originX, originY, topTextLocalX, topTextLocalY, angle);
    page.drawText(topText, {
      x: topTextPos.x,
      y: topTextPos.y,
      size: topFontSize,
      font: fontBold,
      color: textColor,
      opacity: stampOpacity,
      rotate: degrees(angle),
    });

    // 6. Main Center Text: PAID
    const mainText = "PAID";
    const mainFontSize = 26;
    const mainTextWidth = fontBold.widthOfTextAtSize(mainText, mainFontSize);
    const mainTextLocalX = (stampWidth - mainTextWidth) / 2;
    const mainTextLocalY = 24;
    const mainTextPos = rotatePoint(originX, originY, mainTextLocalX, mainTextLocalY, angle);
    page.drawText(mainText, {
      x: mainTextPos.x,
      y: mainTextPos.y,
      size: mainFontSize,
      font: fontBold,
      color: textColor,
      opacity: stampOpacity,
      rotate: degrees(angle),
    });

    // 7. Bottom Subtitle Divider Line
    const botDivY = 17;
    const botDivStart = rotatePoint(originX, originY, inset, botDivY, angle);
    const botDivEnd = rotatePoint(originX, originY, stampWidth - inset, botDivY, angle);
    page.drawLine({
      start: botDivStart,
      end: botDivEnd,
      thickness: 0.8,
      color: strokeColor,
      opacity: stampOpacity,
    });

    // 8. Bottom Date/Settled Text: Invoice Date
    let botFontSize = 6.5;
    while (botFontSize > 4 && fontBold.widthOfTextAtSize(dateText, botFontSize) > stampWidth - 14) {
      botFontSize -= 0.5;
    }
    const botTextWidth = fontBold.widthOfTextAtSize(dateText, botFontSize);
    const botTextLocalX = (stampWidth - botTextWidth) / 2;
    const botTextLocalY = 7;
    const botTextPos = rotatePoint(originX, originY, botTextLocalX, botTextLocalY, angle);
    page.drawText(dateText, {
      x: botTextPos.x,
      y: botTextPos.y,
      size: botFontSize,
      font: fontBold,
      color: textColor,
      opacity: stampOpacity,
      rotate: degrees(angle),
    });
  }

  const modifiedBytes = await pdfDoc.save();
  return Buffer.from(modifiedBytes);
}
