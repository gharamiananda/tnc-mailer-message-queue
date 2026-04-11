import { Resend } from "resend";
import { env } from "../config/env";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendAckEmail(opts: {
  to:        string;
  name:      string;
  ackLink:   string;
  pdfBuffer: Buffer;           // ← PDF attached
}): Promise<void> {
  const { to, name, ackLink, pdfBuffer } = opts;

  const { error } = await resend.emails.send({
    from:    env.FROM_EMAIL,
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

  if (error) throw new Error(`Mail failed for ${to}: ${error.message}`);
}