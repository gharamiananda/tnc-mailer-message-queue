import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";

// ── Constants ──────────────────────────────────────────────────────────────────
const W  = 595.28;  // A4 width
const H  = 841.89;  // A4 height
const ML = 56;      // left margin
const MR = 56;      // right margin
const CW = W - ML - MR;

const C = {
  black:    rgb(0,    0,    0   ),
  darkGray: rgb(0.2,  0.2,  0.2 ),
  midGray:  rgb(0.45, 0.45, 0.45),
  lightGray:rgb(0.85, 0.85, 0.85),
  bgGray:   rgb(0.97, 0.97, 0.97),
  blue:     rgb(0.05, 0.18, 0.42), // company dark blue for accents
  red:      rgb(0.65, 0.1,  0.1 ),
};

// ── Text helpers ───────────────────────────────────────────────────────────────

function wrapText(
  page: any,
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  size: number,
  color: any,
  maxWidth: number
): number {
  const lineH = size * 1.6;
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
  if (line) {
    page.drawText(line, { x, y, size, font, color });
    y -= lineH;
  }
  return y;
}

// Underline a text by drawing a line beneath it
function drawUnderlinedText(
  page: any,
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  size: number,
  color: any
) {
  page.drawText(text, { x, y, size, font, color });
  const tw = font.widthOfTextAtSize(text, size);
  page.drawLine({
    start: { x, y: y - 1.5 },
    end:   { x: x + tw, y: y - 1.5 },
    thickness: 0.8,
    color,
  });
}

// ── Header ─────────────────────────────────────────────────────────────────────
// Matches screenshot: logo left, company info right, no colored bar

async function drawHeader(
  page: any,
  bold: PDFFont,
  regular: PDFFont,
  doc: PDFDocument,
  logoUrl?: string
) {
  const TOP = H - 40;

  // ── Right side: company info ─────────────────────────────────────
  const rightX = W - MR;

  const companyLines = [
    { text: "WOODROCK SOFTONIC PRIVATE LIMITED", font: bold,    size: 9   },
    { text: "Registered Office",                 font: bold,    size: 8   },
    { text: "Fit way Enclave, DN 12, Street 18,",font: regular, size: 7.5 },
    { text: "Salt Lake Sector 5, Kolkata- 700091",font: regular, size: 7.5 },
    { text: "mail: contact@woodrockgroup.in",     font: regular, size: 7.5 },
    { text: "CIN: U74999WB2017PTC222743",         font: regular, size: 7.5 },
  ];

  let cy = TOP;
  for (const line of companyLines) {
    const tw = line.font.widthOfTextAtSize(line.text, line.size);
    page.drawText(line.text, {
      x:    rightX - tw,
      y:    cy,
      size: line.size,
      font: line.font,
      color: C.darkGray,
    });
    cy -= line.size * 1.5;
  }

  // ── Left side: logo ───────────────────────────────────────────────
  if (logoUrl) {
    try {
      const res       = await fetch(logoUrl);
      const buf       = await res.arrayBuffer();
      const bytes     = new Uint8Array(buf);
      const isPng     = bytes[0] === 0x89 && bytes[1] === 0x50;
      const logoImg   = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
      const logoH     = 60;
      const logoW     = logoH * (logoImg.width / logoImg.height);
      page.drawImage(logoImg, { x: ML, y: H - 40 - logoH, width: logoW, height: logoH });
    } catch {
      // logo failed to load — skip silently
    }
  }

  // Divider line under header
  page.drawLine({
    start: { x: ML, y: H - 110 },
    end:   { x: W - MR, y: H - 110 },
    thickness: 0.5,
    color: C.lightGray,
  });
}

// ── Footer ─────────────────────────────────────────────────────────────────────

function drawFooter(page: any, regular: PDFFont, pageNum: number) {
  page.drawLine({
    start: { x: ML, y: 45 },
    end:   { x: W - MR, y: 45 },
    thickness: 0.5,
    color: C.lightGray,
  });

  const foot = "Woodrock Softonic Private Limited  |  contact@woodrockgroup.in  |  CIN: U74999WB2017PTC222743";
  const fw   = regular.widthOfTextAtSize(foot, 7);
  page.drawText(foot, {
    x: (W - fw) / 2, y: 30,
    size: 7, font: regular, color: C.midGray,
  });

  const pg = `Page ${pageNum}`;
  page.drawText(pg, {
    x: W - MR - regular.widthOfTextAtSize(pg, 7),
    y: 14,
    size: 7, font: regular, color: C.lightGray,
  });
}

// ── Body ───────────────────────────────────────────────────────────────────────

function drawBody(
  page: any,
  bold: PDFFont,
  regular: PDFFont,
  name: string,
  designation: string,
  companyName: string
): number {
  let y = H - 128; // start below header divider

  // ── Document title — bold + underlined, centered ──────────────────
  const title = "EMPLOYEE CONDUCT UNDERTAKING & CONFIDENTIALITY DECLARATION";
  const titleSize = 11;
  const tw = bold.widthOfTextAtSize(title, titleSize);
  const titleX = (W - tw) / 2;
  drawUnderlinedText(page, bold, title, titleX, y, titleSize, C.black);
  y -= titleSize * 2.2;

  // ── Date ──────────────────────────────────────────────────────────
  const today = new Date().toLocaleDateString("en-IN", {
    day:   "2-digit",
    month: "2-digit",
    year:  "numeric",
  });
  page.drawText(`Date: ${today}`, { x: ML, y, size: 10, font: regular, color: C.darkGray });
  y -= 28;

  // ── To block ──────────────────────────────────────────────────────
  for (const [line, useBold] of [
    ["To,",                          false],
    ["The All",                      false],
    [companyName.toUpperCase(),      true ],
  ] as [string, boolean][]) {
    page.drawText(line, {
      x: ML, y,
      size: 10,
      font: useBold ? bold : regular,
      color: C.darkGray,
    });
    y -= 16;
  }
  y -= 8;

  // ── Subject ───────────────────────────────────────────────────────
  page.drawText("Subject: ", { x: ML, y, size: 10.5, font: bold, color: C.black });
  page.drawText("Undertaking for Professional Conduct and Data Confidentiality", {
    x:    ML + bold.widthOfTextAtSize("Subject: ", 10.5),
    y,
    size: 10.5,
    font: regular,
    color: C.black,
  });
  y -= 26;

  // ── Opening paragraph ─────────────────────────────────────────────
  const opening = `I, `;
  page.drawText(opening, { x: ML, y, size: 10, font: regular, color: C.black });
  const nameX = ML + regular.widthOfTextAtSize(opening, 10);

  // Name in bold + underlined
  drawUnderlinedText(page, bold, name, nameX, y, 10, C.black);
  const afterNameX = nameX + bold.widthOfTextAtSize(name, 10);

  const afterName = ` employed as`;
  page.drawText(afterName, { x: afterNameX, y, size: 10, font: regular, color: C.black });
  y -= 16;

  // Wrap the rest
  y = wrapText(page, regular,
    `at ${companyName} .hereby acknowledge and agree to the following terms regarding my conduct and responsibilities while interacting with customers and handling company data:`,
    ML, y, 10, C.black, CW);
  y -= 14;

  // ── Sections ──────────────────────────────────────────────────────
  const sections = [
    {
      num: "1", title: "Professional Conduct",
      items: [
        { type: "para", text: "I understand that maintaining professionalism, politeness, and respect in all customer interactions is mandatory as part of my role." },
      ],
    },
    {
      num: "2", title: "Prohibited Behaviour",
      items: [
        { type: "para", text: "I strictly undertake that I will not engage in any of the following behaviours during calls, chats, emails, or any communication with customers:" },
        { type: "bullet", text: "Use of rude, abusive, or offensive language" },
        { type: "bullet", text: "Threatening or intimidating behaviour" },
        { type: "bullet", text: "Sarcastic, disrespectful, or unprofessional tone" },
        { type: "bullet", text: "Any form of misconduct that may harm the company's reputation" },
      ],
    },
    {
      num: "3", title: "Data Protection & Confidentiality",
      items: [
        { type: "para", text: "I acknowledge that all customer data and company information is strictly confidential. I strictly agree that:" },
        { type: "bullet", text: "I will not copy, store, share, or misuse any customer contact details, including phone numbers, email IDs, or personal information" },
        { type: "bullet", text: "I will not record, forward, or leak any customer or company data through any medium (personal phone, email, social media, etc.)" },
        { type: "bullet", text: "I will not use customer data for personal benefit or unauthorized purposes" },
      ],
    },
    {
      num: "4", title: "Consequences of Misconduct",
      items: [
        { type: "para",    text: "I understand that any violation of the above terms will be treated as a serious breach of company policy and may result in strict action, including but not limited to:" },
        { type: "bullet",  text: "Immediate termination of employment without prior notice" },
        { type: "bullet",  text: "Withholding of salary, incentives, and any pending dues may be carried out in accordance with company policy and applicable laws." },
        { type: "penalty", text: "If any employee fails to comply with the above, a penalty of Rs.50,000 may be imposed." },
        { type: "para",    text: "Additionally, the company reserves the right to recover any damages caused due to such actions." },
      ],
    },
    {
      num: "5", title: "Acknowledgement",
      items: [
        { type: "para", text: "I confirm that I have read, understood, and agreed to comply with this undertaking. I accept full responsibility for maintaining professional conduct and safeguarding all confidential information." },
        { type: "para", text: "I am signing this document voluntarily and agree to abide by all the terms mentioned above." },
      ],
    },
  ];

  for (const sec of sections) {
    // Section number + title on same line
    const secLabel = `${sec.num}. `;
    page.drawText(secLabel, { x: ML, y, size: 10, font: bold, color: C.black });
    drawUnderlinedText(
      page, bold, sec.title,
      ML + bold.widthOfTextAtSize(secLabel, 10),
      y, 10, C.black
    );
    y -= 18;

    for (const item of sec.items) {
      if (item.type === "para") {
        y = wrapText(page, regular, `  ${item.text}`, ML, y, 10, C.darkGray, CW);
        y -= 8;
      } else if (item.type === "bullet") {
        y = wrapText(page, regular, `  ${item.text}`, ML + 10, y, 10, C.darkGray, CW - 10);
        y -= 4;
      } else if (item.type === "penalty") {
        y = wrapText(page, bold, `  ${item.text}`, ML, y, 10, C.red, CW);
        y -= 4;
      }
    }
    y -= 10;
  }

  return y;
}

// ── Signature section ──────────────────────────────────────────────────────────

function drawSignatureSection(
  page: any,
  bold: PDFFont,
  regular: PDFFont,
  name: string,
  designation: string,
  startY: number,
  signatureImage?: any
) {
  let y = startY - 12;

  page.drawLine({
    start: { x: ML, y },
    end:   { x: ML + CW, y },
    thickness: 0.4,
    color: C.lightGray,
  });
  y -= 20;

  const leftX  = ML;
  const rightX = ML + CW / 2 + 20;

  // ── Employee side ─────────────────────────────────────────────────
  page.drawText("Employee Name:", { x: leftX, y, size: 10, font: bold, color: C.black });
  page.drawText(name, {
    x:    leftX + bold.widthOfTextAtSize("Employee Name:  ", 10),
    y,    size: 10, font: regular, color: C.black,
  });
  y -= 16;

  page.drawText("Designation:", { x: leftX, y, size: 10, font: bold, color: C.black });
  page.drawText(designation, {
    x:    leftX + bold.widthOfTextAtSize("Designation:  ", 10),
    y,    size: 10, font: regular, color: C.black,
  });
  y -= 20;

  page.drawText("Signature:", { x: leftX, y, size: 10, font: bold, color: C.black });
  y -= 8;

  // Signature box
  const BOX_W = 190, BOX_H = 65;
  page.drawRectangle({
    x: leftX, y: y - BOX_H,
    width: BOX_W, height: BOX_H,
    borderColor: C.lightGray,
    borderWidth: 0.8,
    color: C.bgGray,
  });

  if (signatureImage) {
    page.drawImage(signatureImage, {
      x: leftX + 6, y: y - BOX_H + 6,
      width: BOX_W - 12, height: BOX_H - 12,
    });
  } else {
    // Dotted baseline inside box
    page.drawLine({
      start: { x: leftX + 12, y: y - BOX_H + 18 },
      end:   { x: leftX + BOX_W - 12, y: y - BOX_H + 18 },
      thickness: 0.4,
      color: C.lightGray,
      dashArray: [3, 3],
    });
    const placeholder = "(Employee's Signature)";
    const pw = regular.widthOfTextAtSize(placeholder, 7.5);
    page.drawText(placeholder, {
      x: leftX + (BOX_W - pw) / 2,
      y: y - BOX_H + 6,
      size: 7.5, font: regular, color: C.lightGray,
    });
  }

  // ── Authorized signatory side ──────────────────────────────────────
  const authY = y;
  const authLabel = "Authorized Signatory";
  const alw = bold.widthOfTextAtSize(authLabel, 10);
  page.drawText(authLabel, {
    x: rightX + (170 - alw) / 2,
    y: authY,
    size: 10, font: bold, color: C.black,
  });

  // Signature line
  page.drawLine({
    start: { x: rightX + 10, y: authY - 40 },
    end:   { x: rightX + 160, y: authY - 40 },
    thickness: 0.6,
    color: C.midGray,
  });

  let ay = authY - 52;
  for (const [text, useBold] of [
    ["Simran Jha",                   true ],
    ["HR Department",                false],
    ["Woodrock Softonic Pvt Ltd",    false],
  ] as [string, boolean][]) {
    const f  = useBold ? bold : regular;
    const tw = f.widthOfTextAtSize(text, 9);
    page.drawText(text, {
      x: rightX + (170 - tw) / 2,
      y: ay,
      size: 9, font: f,
      color: useBold ? C.black : C.midGray,
    });
    ay -= 13;
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

export interface PdfOptions {
  employeeName: string;
  designation?: string;
  companyName?: string;
  logoUrl?:     string;       // pass Cloudinary URL or any public image URL
  signatureImageBytes?: Uint8Array;  // optional — embed signature in the PDF
}

export async function generateUndertakingPDF(opts: PdfOptions): Promise<Buffer> {
  const {
    employeeName,
    designation  = "CCE",
    companyName  = "Woodrock Softonic Pvt Ltd",
    logoUrl,
    signatureImageBytes,
  } = opts;

  const doc     = await PDFDocument.create();
  const page    = doc.addPage([W, H]);
  const bold    = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);

  // Embed signature image if provided
  let sigImg;
  if (signatureImageBytes) {
    const isPng = signatureImageBytes[0] === 0x89 && signatureImageBytes[1] === 0x50;
    sigImg = isPng
      ? await doc.embedPng(signatureImageBytes)
      : await doc.embedJpg(signatureImageBytes);
  }

  await drawHeader(page, bold, regular, doc, logoUrl);
  drawFooter(page, regular, 1);
  const finalY = drawBody(page, bold, regular, employeeName, designation, companyName);
  drawSignatureSection(page, bold, regular, employeeName, designation, finalY, sigImg);

  return Buffer.from(await doc.save());
}