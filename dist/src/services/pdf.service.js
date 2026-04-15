"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUndertakingPDF = generateUndertakingPDF;
const pdf_lib_1 = require("pdf-lib");
const W = 595.28;
const H = 841.89;
const ML = 50;
const MR = 50;
const CW = W - ML - MR;
const BLACK = (0, pdf_lib_1.rgb)(0, 0, 0);
const DARK_GRAY = (0, pdf_lib_1.rgb)(0.15, 0.15, 0.15);
const MID_GRAY = (0, pdf_lib_1.rgb)(0.4, 0.4, 0.4);
const LIGHT_GRAY = (0, pdf_lib_1.rgb)(0.75, 0.75, 0.75);
const BOX_BG = (0, pdf_lib_1.rgb)(0.96, 0.96, 0.96);
const LINK_BLUE = (0, pdf_lib_1.rgb)(0.1, 0.2, 0.7);
const FOOTER_LINES = [
    { bold: "Kolkata (HQ):", rest: " Fitway Enclave, DN 12, Street 18, Salt Lake Sector V, Kolkata - 700091" },
    { bold: "Lucknow:", rest: " 8th Floor, Bhavya Corporate Tower, Gomti Nagar, Lucknow - 226010" },
    { bold: "Dehradun:", rest: " 3rd Floor, Plot No. 41, Doon IT Park, Shashtradhra Road, Dehradun - 248001" },
    { bold: "Mysuru:", rest: " 1st Floor, 1269, Vijayanagar 4th Stage, Mysuru - 570032" },
];
// ── Text helpers ──────────────────────────────────────────────────────────────
function wrap(page, font, text, x, y, size, color, maxW) {
    const lh = size * 1.55;
    const words = text.split(" ");
    let line = "";
    for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (font.widthOfTextAtSize(test, size) > maxW && line) {
            page.drawText(line, { x, y, size, font, color });
            y -= lh;
            line = w;
        }
        else {
            line = test;
        }
    }
    if (line) {
        page.drawText(line, { x, y, size, font, color });
        y -= lh;
    }
    return y;
}
function underlineText(page, font, text, x, y, size, color) {
    page.drawText(text, { x, y, size, font, color });
    const tw = font.widthOfTextAtSize(text, size);
    page.drawLine({
        start: { x, y: y - 1.5 }, end: { x: x + tw, y: y - 1.5 },
        thickness: 0.7, color,
    });
}
// ── Shared header ─────────────────────────────────────────────────────────────
async function drawHeader(page, bold, regular, doc, logoUrl) {
    // Company info — right aligned
    const lines = [
        { text: "WOODROCK SOFTONIC PRIVATE LIMITED", font: bold, size: 9 },
        { text: "Registered Office", font: bold, size: 8 },
        { text: "Fit way Enclave, DN 12, Street 18,", font: regular, size: 7.5 },
        { text: "Salt Lake Sector 5, Kolkata- 700091", font: regular, size: 7.5 },
        { text: "mail: contact@woodrockgroup.in", font: regular, size: 7.5 },
        { text: "CIN: U74999WB2017PTC222743", font: regular, size: 7.5 },
    ];
    let cy = H - 38;
    for (const l of lines) {
        const tw = l.font.widthOfTextAtSize(l.text, l.size);
        page.drawText(l.text, { x: W - MR - tw, y: cy, size: l.size, font: l.font, color: DARK_GRAY });
        cy -= l.size * 1.5;
    }
    // Logo — left side
    if (logoUrl) {
        try {
            const res = await fetch(logoUrl);
            const buf = await res.arrayBuffer();
            const bytes = new Uint8Array(buf);
            const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
            const img = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
            const lh = 65;
            const lw = lh * (img.width / img.height);
            page.drawImage(img, { x: ML, y: H - 40 - lh, width: lw, height: lh });
        }
        catch { /* skip silently */ }
    }
    // Divider line
    page.drawLine({
        start: { x: ML, y: H - 115 }, end: { x: W - MR, y: H - 115 },
        thickness: 0.4, color: LIGHT_GRAY,
    });
}
// ── Shared footer (office addresses) ─────────────────────────────────────────
function drawFooter(page, bold, regular) {
    page.drawLine({
        start: { x: ML, y: 100 }, end: { x: W - MR, y: 100 },
        thickness: 0.4, color: LIGHT_GRAY,
    });
    let fy = 88;
    for (const f of FOOTER_LINES) {
        const bw = bold.widthOfTextAtSize(f.bold, 7.5);
        page.drawText(f.bold, { x: ML, y: fy, size: 7.5, font: bold, color: BLACK });
        page.drawText(f.rest, { x: ML + bw, y: fy, size: 7.5, font: regular, color: DARK_GRAY });
        fy -= 12;
    }
}
// ── Section header helper ─────────────────────────────────────────────────────
function sectionHeader(page, bold, regular, num, title, y) {
    const numStr = `${num}. `;
    page.drawText(numStr, { x: ML, y, size: 10, font: bold, color: BLACK });
    page.drawText(title, { x: ML + bold.widthOfTextAtSize(numStr, 10), y, size: 10, font: regular, color: BLACK });
    return y - 18;
}
// ── PAGE 1 ────────────────────────────────────────────────────────────────────
function drawPage1(page, bold, regular, name, designation, companyName) {
    let y = H - 132;
    // Title — bold, underlined, left-aligned
    underlineText(page, bold, "EMPLOYEE CONDUCT UNDERTAKING & CONFIDENTIALITY DECLARATION", ML, y, 11, BLACK);
    y -= 30;
    // Date
    const today = new Date().toLocaleDateString("en-IN", {
        day: "2-digit", month: "2-digit", year: "numeric",
    });
    page.drawText(`Date:${today}`, { x: ML, y, size: 10, font: regular, color: DARK_GRAY });
    y -= 32;
    // To block
    page.drawText("To,", { x: ML, y, size: 10, font: regular, color: DARK_GRAY });
    y -= 18;
    page.drawText("The All", { x: ML, y, size: 10, font: regular, color: DARK_GRAY });
    y -= 18;
    page.drawText(companyName.toUpperCase(), { x: ML, y, size: 10, font: bold, color: DARK_GRAY });
    y -= 18;
    y -= 4;
    // Subject
    page.drawText("Subject: ", { x: ML, y, size: 10, font: bold, color: BLACK });
    page.drawText("Undertaking for Professional Conduct and Data Confidentiality", { x: ML + bold.widthOfTextAtSize("Subject: ", 10), y, size: 10, font: regular, color: DARK_GRAY });
    y -= 28;
    // Opening paragraph — name bold + underlined inline
    const pre = "I, ";
    page.drawText(pre, { x: ML, y, size: 10, font: bold, color: BLACK });
    const nx = ML + bold.widthOfTextAtSize(pre, 10);
    underlineText(page, bold, name, nx, y, 10, BLACK);
    const ax = nx + bold.widthOfTextAtSize(name, 10);
    page.drawText(" employed as", { x: ax, y, size: 10, font: regular, color: BLACK });
    y -= 16;
    y = wrap(page, regular, `at ${companyName} .hereby acknowledge and agree to the following terms regarding my conduct and responsibilities while interacting with customers and handling company data:`, ML, y, 10, DARK_GRAY, CW);
    y -= 18;
    // ── Section 1 ──
    y = sectionHeader(page, bold, regular, "1", "Professional Conduct", y);
    y = wrap(page, regular, "  I understand that maintaining professionalism, politeness, and respect in all customer interactions is mandatory as part of my role.", ML, y, 10, DARK_GRAY, CW);
    y -= 18;
    // ── Section 2 ──
    y = sectionHeader(page, bold, regular, "2", "Prohibited Behaviour", y);
    y = wrap(page, regular, "  I strictly undertake that I will not engage in any of the following behaviours during calls, chats, emails, or any communication with customers:", ML, y, 10, DARK_GRAY, CW);
    y -= 10;
    for (const b of [
        "Use of rude, abusive, or offensive language",
        "Threatening or intimidating behaviour",
        "Sarcastic, disrespectful, or unprofessional tone",
        "Any form of misconduct that may harm the company's reputation",
    ]) {
        y = wrap(page, regular, `  ${b}`, ML + 10, y, 10, DARK_GRAY, CW - 10);
        y -= 6;
    }
}
// ── PAGE 2 ────────────────────────────────────────────────────────────────────
function drawPage2(page, bold, regular) {
    let y = H - 132;
    // ── Section 3 ──
    y = sectionHeader(page, bold, regular, "3", "Data Protection & Confidentiality", y);
    y = wrap(page, regular, "  I acknowledge that all customer data and company information is strictly confidential. I strictly agree that:", ML, y, 10, DARK_GRAY, CW);
    y -= 10;
    for (const b of [
        "I will not copy, store, share, or misuse any customer contact details, including phone numbers, email IDs, or personal information",
        "I will not record, forward, or leak any customer or company data through any medium (personal phone, email, social media, etc.)",
        "I will not use customer data for personal benefit or unauthorized purposes",
    ]) {
        y = wrap(page, regular, `  ${b}`, ML + 10, y, 10, DARK_GRAY, CW - 10);
        y -= 8;
    }
    y -= 18;
    // ── Section 4 ──
    y = sectionHeader(page, bold, regular, "4", "Consequences of Misconduct", y);
    y = wrap(page, regular, "  I understand that any violation of the above terms will be treated as a serious breach of company policy and may result in strict action, including but not limited to:", ML, y, 10, DARK_GRAY, CW);
    y -= 10;
    for (const b of [
        "Immediate termination of employment without prior notice",
        "Withholding of salary, incentives, and any pending dues may be carried out in accordance with company policy and applicable laws.",
    ]) {
        y = wrap(page, regular, `  ${b}`, ML + 10, y, 10, DARK_GRAY, CW - 10);
        y -= 8;
    }
    y -= 4;
    y = wrap(page, regular, "If any employee fails to comply with the above, a penalty of Rs.50,000 may be imposed.", ML, y, 10, DARK_GRAY, CW);
    y -= 4;
    y = wrap(page, regular, "Additionally, the company reserves the right to recover any damages caused due to such actions.", ML, y, 10, DARK_GRAY, CW);
}
// ── PAGE 3 ────────────────────────────────────────────────────────────────────
async function drawPage3(page, bold, regular, doc, name, designation, signatureImageBytes, stampUrl) {
    let y = H - 132;
    // ── Section 5 ──
    y = sectionHeader(page, bold, regular, "5", "Acknowledgement", y);
    y = wrap(page, regular, "  I confirm that I have read, understood, and agreed to comply with this undertaking. I accept full responsibility for maintaining professional conduct and safeguarding all confidential information.", ML, y, 10, DARK_GRAY, CW);
    y -= 4;
    y = wrap(page, regular, "I am signing this document voluntarily and agree to abide by all the terms mentioned above.", ML, y, 10, DARK_GRAY, CW);
    y -= 20;
    // Employee name
    page.drawText("Employee Name: ", { x: ML, y, size: 10, font: regular, color: BLACK });
    page.drawText(name, {
        x: ML + regular.widthOfTextAtSize("Employee Name: ", 10),
        y, size: 10, font: bold, color: BLACK,
    });
    y -= 20;
    // Designation
    page.drawText("Designation: ", { x: ML, y, size: 10, font: regular, color: BLACK });
    page.drawText(designation, {
        x: ML + regular.widthOfTextAtSize("Designation: ", 10),
        y, size: 10, font: regular, color: BLACK,
    });
    y -= 28;
    // Employee signature image placeholder
    const SW = 180, SH = 70;
    page.drawRectangle({
        x: ML, y: y - SH, width: SW, height: SH,
        borderColor: LIGHT_GRAY, borderWidth: 0.6, color: BOX_BG,
    });
    if (signatureImageBytes) {
        const isPng = signatureImageBytes[0] === 0x89 && signatureImageBytes[1] === 0x50;
        const sImg = isPng ? await doc.embedPng(signatureImageBytes) : await doc.embedJpg(signatureImageBytes);
        page.drawImage(sImg, { x: ML + 5, y: y - SH + 5, width: SW - 10, height: SH - 10 });
    }
    y -= SH + 14;
    page.drawText("Signature:", { x: ML, y, size: 10, font: regular, color: BLACK });
    y -= 28;
    // Authorized signatory
    page.drawText("Authorized Signatory", { x: ML, y, size: 10, font: regular, color: BLACK });
    y -= 16;
    // Stamp image
    const STAMP_W = 130, STAMP_H = 110;
    if (stampUrl) {
        try {
            const res = await fetch(stampUrl);
            const buf = await res.arrayBuffer();
            const bytes = new Uint8Array(buf);
            const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
            const img = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
            page.drawImage(img, { x: ML, y: y - STAMP_H, width: STAMP_W, height: STAMP_H });
        }
        catch { /* skip */ }
    }
    y -= STAMP_H + 14;
    // Simran Jha || HR Department (bold, centered under stamp)
    page.drawText("Simran Jha || HR Department", {
        x: ML + 4, y, size: 10, font: bold, color: BLACK,
    });
    y -= 16;
    // Company name — bold + underlined
    underlineText(page, bold, "Woodrock Softonic Pvt Ltd", ML, y, 10, BLACK);
    y -= 16;
    // Email
    page.drawText("Email: ", { x: ML, y, size: 10, font: regular, color: BLACK });
    page.drawText("Simran.jha@woodrockgroup.in", {
        x: ML + regular.widthOfTextAtSize("Email: ", 10),
        y, size: 10, font: regular, color: LINK_BLUE,
    });
}
async function generateUndertakingPDF(opts) {
    const { employeeName, designation = "CCE", companyName = "Woodrock Softonic Pvt Ltd", logoUrl, stampUrl, signatureImageBytes, } = opts;
    const doc = await pdf_lib_1.PDFDocument.create();
    const bold = await doc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
    const regular = await doc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
    // Page 1
    const p1 = doc.addPage([W, H]);
    await drawHeader(p1, bold, regular, doc, logoUrl);
    drawFooter(p1, bold, regular);
    drawPage1(p1, bold, regular, employeeName, designation, companyName);
    // Page 2
    const p2 = doc.addPage([W, H]);
    await drawHeader(p2, bold, regular, doc, logoUrl);
    drawFooter(p2, bold, regular);
    drawPage2(p2, bold, regular);
    // Page 3
    const p3 = doc.addPage([W, H]);
    await drawHeader(p3, bold, regular, doc, logoUrl);
    drawFooter(p3, bold, regular);
    await drawPage3(p3, bold, regular, doc, employeeName, designation, signatureImageBytes, stampUrl);
    return Buffer.from(await doc.save());
}
