import nodemailer from "nodemailer";
import { env } from "../config/env";

// ── Single shared transporter ─────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   "smtp.gmail.com",
  port:   587,
  secure: false,
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// ── Initial undertaking email ─────────────────────────────────────────────────
export async function sendAckEmail(opts: {
  to:        string;
  name:      string;
  ackLink:   string;
  pdfBuffer: Buffer;
}): Promise<void> {
  const { to, name, ackLink, pdfBuffer } = opts;

   const info = await transporter.sendMail({
    from:    `"Woodrock Softonic Pvt Ltd" <${env.GMAIL_USER}>`,
    to,
    subject: "Action Required: Please acknowledge and sign",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:40px 16px">
              <table width="560" cellpadding="0" cellspacing="0"
                     style="background:#fff;border-radius:8px;overflow:hidden;
                            border:1px solid #e0e0e0">
                <tr>
                  <td style="background:#1a237e;padding:28px 32px">
                    <h2 style="margin:0;color:#fff;font-size:18px;font-weight:700">
                      Woodrock Softonic Pvt Ltd
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px">
                    <p style="margin:0 0 12px;font-size:15px;color:#212121">
                      Dear <strong>${name}</strong>,
                    </p>
                    <p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.7">
                      Please find the <strong>Employee Conduct Undertaking &amp;
                      Confidentiality Declaration</strong> attached to this email.
                    </p>
                    <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.7">
                      Kindly review the document and click the button below to
                      acknowledge and submit your digital signature.
                    </p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#1a237e;border-radius:6px">
                          <a href="${ackLink}"
                             style="display:inline-block;padding:13px 32px;
                                    color:#fff;font-weight:700;font-size:14px;
                                    text-decoration:none">
                            Acknowledge &amp; Sign
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:24px 0 0;font-size:12px;color:#aaa">
                      This link expires in 30 days. Do not share it.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 32px;background:#fafafa;
                             border-top:1px solid #eee;text-align:center">
                    <p style="margin:0;font-size:11px;color:#bbb">
                      Woodrock Softonic Pvt Ltd &nbsp;|&nbsp; contact@woodrockgroup.in
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: "Employee_Conduct_Undertaking.pdf",
        content:  pdfBuffer,
      },
    ],
  });

    if (info.rejected && info.rejected.length > 0) {
    throw new Error(`Email rejected for: ${info.rejected.join(", ")}`);
  }
}

// ── Confirmation email after acknowledgement ──────────────────────────────────
export async function sendAckConfirmationEmail(opts: {
  to:        string;
  name:      string;
  pdfBuffer: Buffer;
}): Promise<void> {
  const { to, name, pdfBuffer } = opts;

  await transporter.sendMail({
    from:    `"Woodrock Softonic Pvt Ltd" <${env.GMAIL_USER}>`,
    to,
    subject: "Acknowledgement Confirmed — Woodrock Softonic Pvt Ltd",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:40px 16px">
              <table width="560" cellpadding="0" cellspacing="0"
                     style="background:#fff;border-radius:8px;overflow:hidden;
                            border:1px solid #e0e0e0">
                <tr>
                  <td style="background:#1a237e;padding:28px 32px">
                    <h2 style="margin:0;color:#fff;font-size:18px;font-weight:700">
                      Woodrock Softonic Pvt Ltd
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px">
                    <div style="text-align:center;margin-bottom:24px">
                      <div style="width:56px;height:56px;background:#e8f5e9;border-radius:50%;
                                  display:inline-block;line-height:56px;text-align:center">
                        <span style="color:#2e7d32;font-size:28px">&#10003;</span>
                      </div>
                    </div>
                    <p style="margin:0 0 8px;font-size:16px;color:#212121;
                               text-align:center;font-weight:700">
                      Acknowledgement Received
                    </p>
                    <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.7">
                      Dear <strong>${name}</strong>,
                    </p>
                    <p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.7">
                      Thank you for acknowledging the <strong>Employee Conduct Undertaking
                      &amp; Confidentiality Declaration</strong>. Your signed document has
                      been recorded successfully.
                    </p>
                    <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.7">
                      Please find your signed copy attached to this email for your records.
                    </p>
                    <div style="background:#f8f9fa;border-left:4px solid #1a237e;
                                padding:12px 16px;border-radius:0 6px 6px 0;margin-bottom:24px">
                      <p style="margin:0;font-size:13px;color:#555">
                        For any questions, contact HR at
                        <a href="mailto:Simran.jha@woodrockgroup.in"
                           style="color:#1a237e;text-decoration:none">
                          Simran.jha@woodrockgroup.in
                        </a>
                      </p>
                    </div>
                    <p style="margin:0;font-size:13px;color:#888">
                      Regards,<br/>
                      <strong>Simran Jha</strong><br/>
                      HR Department<br/>
                      Woodrock Softonic Pvt Ltd
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 32px;background:#fafafa;
                             border-top:1px solid #eee;text-align:center">
                    <p style="margin:0;font-size:11px;color:#bbb">
                      Woodrock Softonic Pvt Ltd &nbsp;|&nbsp; contact@woodrockgroup.in
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: `${name.replace(/\s+/g, "_")}_Signed_Undertaking.pdf`,
        content:  pdfBuffer,
      },
    ],
  });
}