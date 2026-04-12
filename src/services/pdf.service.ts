import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { LOGO_B64, STAMP_B64 } from "../assets/images";

const C = {
  darkBlue:  rgb(0.102, 0.137, 0.494),
  midBlue:   rgb(0.157, 0.208, 0.576),
  gold:      rgb(0.784, 0.663, 0.318),
  deepRed:   rgb(0.718, 0.11,  0.11),
  lightGray: rgb(0.98,  0.98,  0.98),
  midGray:   rgb(0.62,  0.62,  0.62),
  charcoal:  rgb(0.259, 0.259, 0.259),
  black:     rgb(0, 0, 0),
  white:     rgb(1, 1, 1),
};

const W = 595.28;
const H = 841.89;
const ML = 56;
const CW = W - ML - 56; // 483.28pt usable width

export interface PdfOptions {
  employeeName: string;
  designation?: string;
  companyName?: string;
}


export async function generateUndertakingPDF(opts: PdfOptions): Promise<Buffer> {
  const {
    employeeName,
    designation  = "CCE",
    companyName  = "Woodrock Softonic Pvt Ltd",
  } = opts;

  const doc     = await PDFDocument.create();
  const page    = doc.addPage([W, H]);
  const bold    = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);

  // Auto-detect JPEG vs PNG by checking magic bytes
  const logoBuffer  = Buffer.from(LOGO_B64,  "base64");
  const stampBuffer = Buffer.from(STAMP_B64, "base64");

  const logoImg  = isJpeg(logoBuffer)  ? await doc.embedJpg(logoBuffer)  : await doc.embedPng(logoBuffer);
  const stampImg = isJpeg(stampBuffer) ? await doc.embedJpg(stampBuffer) : await doc.embedPng(stampBuffer);

  drawHeader(page, bold, regular, logoImg, companyName);
  drawFooter(page, regular);
  const finalY = drawBody(page, bold, regular, employeeName, designation, companyName);
  drawSignatureSection(page, bold, regular, stampImg, employeeName, designation, finalY);

  return Buffer.from(await doc.save());
}

// Check if buffer is a JPEG by reading magic bytes
function isJpeg(buffer: Buffer): boolean {
  return buffer[0] === 0xff && buffer[1] === 0xd8;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function wrapText(
  page: any, font: any, text: string,
  x: number, y: number, size: number,
  color: any, maxWidth = CW
): number {
  const lineH = size * 1.5;
  const words = text.split(" ");
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      page.drawText(line, { x, y, size, font, color });
      y -= lineH;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) { page.drawText(line, { x, y, size, font, color }); y -= lineH; }
  return y;
}

// ── Header ────────────────────────────────────────────────────────────────────

function drawHeader(page: any, bold: any, regular: any, logo: any, companyName: string) {
  const BAR = 72;
  page.drawRectangle({ x: 0, y: H - BAR, width: W, height: BAR, color: C.darkBlue });
  page.drawLine({
    start: { x: 0, y: H - BAR - 2 }, end: { x: W, y: H - BAR - 2 },
    thickness: 2.5, color: C.gold,
  });

  const logoH = 44;
  const logoW = logoH * (logo.width / logo.height);
  page.drawImage(logo, { x: ML, y: H - BAR + (BAR - logoH) / 2, width: logoW, height: logoH });

  const tx = ML + logoW + 12;
  page.drawText(companyName.toUpperCase(), {
    x: tx, y: H - 26, size: 13, font: bold, color: C.white,
  });
  page.drawText("Fit Way Enclave, DN 12, Street 18, Salt Lake Sector 5, Kolkata - 700091", {
    x: tx, y: H - 44, size: 7.5, font: regular, color: rgb(0.69, 0.745, 0.773),
  });
  page.drawText("contact@woodrockgroup.in  |  CIN: U74999WB2017PTC222743", {
    x: tx, y: H - 58, size: 7.5, font: regular, color: rgb(0.69, 0.745, 0.773),
  });
}

// ── Footer ────────────────────────────────────────────────────────────────────

function drawFooter(page: any, regular: any) {
  page.drawRectangle({ x: 0, y: 0, width: W, height: 36, color: C.darkBlue });
  page.drawLine({
    start: { x: 0, y: 36 }, end: { x: W, y: 36 }, thickness: 1.5, color: C.gold,
  });
  const foot = "Woodrock Softonic Pvt Ltd  |  contact@woodrockgroup.in  |  CIN: U74999WB2017PTC222743";
  page.drawText(foot, {
    x: (W - regular.widthOfTextAtSize(foot, 7)) / 2, y: 22,
    size: 7, font: regular, color: rgb(0.69, 0.745, 0.773),
  });
}

// ── Body ──────────────────────────────────────────────────────────────────────

function drawBody(
  page: any, bold: any, regular: any,
  name: string, designation: string, companyName: string
): number {
  let y = H - 98;

  // Title banner
  page.drawRectangle({ x: ML, y: y - 24, width: CW, height: 24, color: C.darkBlue, borderRadius: 4 });
  const title = "EMPLOYEE CONDUCT UNDERTAKING & CONFIDENTIALITY DECLARATION";
  page.drawText(title, {
    x: ML + (CW - bold.widthOfTextAtSize(title, 10)) / 2,
    y: y - 24 + 7, size: 10, font: bold, color: C.white,
  });
  y -= 36;

  // Meta block
  for (const [line, useBold] of [
    ["Date: _______________________", false],
    ["To,", false],
    ["The Management", false],
    [companyName.toUpperCase(), true],
  ] as [string, boolean][]) {
    page.drawText(line, { x: ML, y, size: 9.5, font: useBold ? bold : regular, color: C.charcoal });
    y -= 14;
  }
  y -= 4;

  // Subject
  page.drawText("Subject: ", { x: ML, y, size: 10, font: bold, color: C.darkBlue });
  page.drawText("Undertaking for Professional Conduct and Data Confidentiality", {
    x: ML + bold.widthOfTextAtSize("Subject: ", 10),
    y, size: 10, font: bold, color: C.darkBlue,
  });
  y -= 10;
  page.drawLine({
    start: { x: ML, y }, end: { x: ML + CW, y },
    thickness: 0.5, color: rgb(0.88, 0.88, 0.88),
  });
  y -= 14;

  // Opening
  y = wrapText(page, regular,
    `I, ${name}, employed as ${designation} at ${companyName}, hereby acknowledge and agree to the following terms regarding my conduct and responsibilities while interacting with customers and handling company data:`,
    ML, y, 9.5, C.black);
  y -= 6;

  // Sections
  const sections = [
    {
      title: "1.  Professional Conduct",
      items: [
        { type: "para",   text: "I understand that maintaining professionalism, politeness, and respect in all customer interactions is mandatory as part of my role." },
      ],
    },
    {
      title: "2.  Prohibited Behaviour",
      items: [
        { type: "para",   text: "I strictly undertake that I will not engage in any of the following behaviours during calls, chats, emails, or any communication with customers:" },
        { type: "bullet", text: "Use of rude, abusive, or offensive language" },
        { type: "bullet", text: "Threatening or intimidating behaviour" },
        { type: "bullet", text: "Sarcastic, disrespectful, or unprofessional tone" },
        { type: "bullet", text: "Any form of misconduct that may harm the company's reputation" },
      ],
    },
    {
      title: "3.  Data Protection & Confidentiality",
      items: [
        { type: "para",   text: "I acknowledge that all customer data and company information is strictly confidential. I strictly agree that:" },
        { type: "bullet", text: "I will not copy, store, share, or misuse any customer contact details, including phone numbers, email IDs, or personal information" },
        { type: "bullet", text: "I will not record, forward, or leak any customer or company data through any medium (personal phone, email, social media, etc.)" },
        { type: "bullet", text: "I will not use customer data for personal benefit or unauthorized purposes" },
      ],
    },
    {
      title: "4.  Consequences of Misconduct",
      items: [
        { type: "para",    text: "I understand that any violation of the above terms will be treated as a serious breach of company policy and may result in strict action, including but not limited to:" },
        { type: "bullet",  text: "Immediate termination of employment without prior notice" },
        { type: "bullet",  text: "Withholding of salary, incentives, and any pending dues may be carried out in accordance with company policy and applicable laws" },
        { type: "penalty", text: "If any employee fails to comply with the above, a penalty of Rs.50,000 may be imposed." },
        { type: "para",    text: "Additionally, the company reserves the right to recover any damages caused due to such actions." },
      ],
    },
    {
      title: "5.  Acknowledgement",
      items: [
        { type: "para", text: "I confirm that I have read, understood, and agreed to comply with this undertaking. I accept full responsibility for maintaining professional conduct and safeguarding all confidential information." },
        { type: "para", text: "I am signing this document voluntarily and agree to abide by all the terms mentioned above." },
      ],
    },
  ];

  for (const sec of sections) {
    page.drawRectangle({ x: ML, y: y - 18, width: CW, height: 18, color: C.midBlue, borderRadius: 2 });
    page.drawText(sec.title, { x: ML + 8, y: y - 18 + 5, size: 10, font: bold, color: C.white });
    y -= 26;

    for (const item of sec.items) {
      if (item.type === "para") {
        y = wrapText(page, regular, item.text, ML, y, 9.5, C.black);
        y -= 4;
      } else if (item.type === "bullet") {
        page.drawText("•", { x: ML + 8, y, size: 9.5, font: bold, color: C.black });
        y = wrapText(page, regular, item.text, ML + 20, y, 9.5, C.black, CW - 20);
        y -= 3;
      } else if (item.type === "penalty") {
        y = wrapText(page, bold, item.text, ML + 8, y, 9.5, C.deepRed, CW - 8);
        y -= 3;
      }
    }
    y -= 4;
  }

  return y;
}

// ── Signature section ─────────────────────────────────────────────────────────

function drawSignatureSection(
  page: any, bold: any, regular: any,
  stamp: any, name: string, designation: string, startY: number
) {
  let y = startY - 8;

  page.drawLine({
    start: { x: ML, y }, end: { x: ML + CW, y },
    thickness: 0.5, color: rgb(0.88, 0.88, 0.88),
  });
  y -= 16;

  const leftX  = ML;
  const rightX = ML + CW / 2 + 10;

  // Employee details
  page.drawText("Employee Name:", { x: leftX, y, size: 9.5, font: bold, color: C.black });
  page.drawText(name, {
    x: leftX + bold.widthOfTextAtSize("Employee Name:  ", 9.5),
    y, size: 9.5, font: regular, color: C.black,
  });
  y -= 14;

  page.drawText("Designation:", { x: leftX, y, size: 9.5, font: bold, color: C.black });
  page.drawText(designation, {
    x: leftX + bold.widthOfTextAtSize("Designation:  ", 9.5),
    y, size: 9.5, font: regular, color: C.black,
  });
  y -= 16;

  page.drawText("Signature:", { x: leftX, y, size: 9.5, font: bold, color: C.black });
  y -= 6;

  // Signature placeholder box
  page.drawRectangle({
    x: leftX, y: y - 60, width: 180, height: 60,
    borderColor: C.midGray, borderWidth: 0.5, color: C.lightGray,
  });
  page.drawLine({
    start: { x: leftX + 10, y: y - 60 + 16 },
    end:   { x: leftX + 170, y: y - 60 + 16 },
    thickness: 0.4, color: C.midGray, dashArray: [3, 3],
  });
  const sigLabel = "(Employee's Signature)";
  page.drawText(sigLabel, {
    x: leftX + (180 - regular.widthOfTextAtSize(sigLabel, 7.5)) / 2,
    y: y - 60 + 4, size: 7.5, font: regular, color: C.midGray,
  });

  // Authorized signatory
  const authLabel = "Authorized Signatory";
  page.drawText(authLabel, {
    x: rightX + (160 - bold.widthOfTextAtSize(authLabel, 9.5)) / 2,
    y: y + 6, size: 9.5, font: bold, color: C.darkBlue,
  });

  const sH = 56;
  const sW = sH * (stamp.width / stamp.height);
  page.drawImage(stamp, { x: rightX + (160 - sW) / 2, y: y - sH + 2, width: sW, height: sH });

  let ay = y - sH - 8;
  for (const [text, useBold] of [
    ["Simran Jha", true], ["HR Department", false], ["Woodrock Softonic Pvt Ltd", false],
  ] as [string, boolean][]) {
    const f = useBold ? bold : regular;
    page.drawText(text, {
      x: rightX + (160 - f.widthOfTextAtSize(text, 9)) / 2,
      y: ay, size: 9, font: f, color: useBold ? C.black : C.midGray,
    });
    ay -= 12;
  }
}