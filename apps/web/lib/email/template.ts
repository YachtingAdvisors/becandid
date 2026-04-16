// ============================================================
// lib/email/template.ts
//
// Shared email wrapper for all Be Candid transactional emails.
// Provides consistent branding, responsive layout, and dark
// mode support across all email types.
//
// Usage:
//   import { emailWrapper } from '@/lib/email/template';
//   const html = emailWrapper({
//     body: '<h2>Hello!</h2><p>Content here</p>',
//     ctaUrl: 'https://becandid.io/dashboard',
//     ctaLabel: 'Open Dashboard',
//   });
// ============================================================

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

export function emailWrapper(params: {
  preheader?: string;
  body: string;
  ctaUrl?: string;
  ctaLabel?: string;
  footerNote?: string;
}): string {
  const { preheader, body, ctaUrl, ctaLabel, footerNote } = params;

  const ctaBlock = ctaUrl && ctaLabel
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
        <tr><td align="center">
          <a href="${ctaUrl}" target="_blank" class="cta-btn" style="display:inline-block;background:linear-gradient(135deg,#226779 0%,#2d8a9e 100%);background-color:#226779;color:#ffffff;padding:14px 36px;border-radius:100px;text-decoration:none;font-weight:700;font-size:15px;line-height:1.2;mso-padding-alt:0;box-shadow:0 2px 8px rgba(34,103,121,0.25);">
            <!--[if mso]><i style="mso-font-width:150%;mso-text-raise:22pt">&nbsp;</i><![endif]-->
            <span style="mso-text-raise:11pt;">${ctaLabel}</span>
            <!--[if mso]><i style="mso-font-width:150%">&nbsp;</i><![endif]-->
          </a>
        </td></tr>
      </table>`
    : '';

  const footerNoteBlock = footerNote
    ? `<p style="margin:12px 0 0;color:#9ca3af;font-size:12px;line-height:1.5;font-style:italic;">${footerNote}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Be Candid</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    body { margin:0; padding:0; width:100%; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { border:0; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
    a { color:#226779; }

    @media (prefers-color-scheme: dark) {
      body, .bg-body { background-color:#1a1a2e !important; }
      .bg-card { background-color:#262640 !important; border-color:#3a3a5c !important; }
      .bg-header { background:#1b3a44 !important; }
      .header-gradient { background:linear-gradient(135deg,#1b3a44 0%,#163040 100%) !important; background-color:#1b3a44 !important; }
      .text-heading { color:#e2e8f0 !important; }
      .text-body { color:#cbd5e1 !important; }
      .text-muted { color:#94a3b8 !important; }
      .text-footer { color:#64748b !important; }
      .cta-btn { background:linear-gradient(135deg,#2d8a9e 0%,#34a3b8 100%) !important; background-color:#2d8a9e !important; }
      .divider { border-color:#3a3a5c !important; }
      .footer-divider { border-color:#3a3a5c !important; }
      .social-icon { filter:brightness(0.8) !important; }
      .crisis-bar { background-color:#2a2a45 !important; border-color:#3a3a5c !important; }
      .crisis-bar-text { color:#94a3b8 !important; }
      .crisis-bar-link { color:#6dd5ed !important; }
    }

    @media only screen and (max-width: 560px) {
      .container { width:100% !important; padding:12px !important; }
      .card { padding:24px 20px !important; }
      .header-pill { padding:5px 14px !important; font-size:11px !important; }
      .logo-img { width:120px !important; height:auto !important; }
      .header-bar { padding:20px 16px !important; }
      .footer-social td { padding:0 6px !important; }
    }
  </style>
</head>
<body class="bg-body" style="margin:0;padding:0;background-color:#f9fafb;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  ${preheader ? `<div style="display:none;font-size:1px;color:#f9fafb;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}${'&#847; &zwnj; &nbsp; '.repeat(30)}</div>` : ''}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;" class="bg-body">
    <tr><td align="center" style="padding:0;">

      <!-- Gradient header bar with logo -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center" class="header-gradient header-bar" style="background:linear-gradient(135deg,#226779 0%,#1a4f5e 50%,#164048 100%);background-color:#226779;padding:28px 16px 24px;">
          <a href="${APP_URL}" target="_blank" style="text-decoration:none;">
            <img src="https://becandid.io/logo.png" alt="Be Candid" width="140" class="logo-img" style="display:block;width:140px;height:auto;margin:0 auto;" />
          </a>
        </td></tr>
      </table>

      <!-- Main content container -->
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" class="container" style="max-width:520px;width:100%;padding:0 16px;">

        <!-- Spacer -->
        <tr><td style="height:24px;"></td></tr>

        <!-- Card body -->
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-card card" style="background-color:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">
            <tr><td style="padding:32px 28px;">
              ${body}
              ${ctaBlock}
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer note (if any) -->
        <tr><td style="padding-top:16px;text-align:center;">
          ${footerNoteBlock}
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:20px 0 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td class="footer-divider" style="border-top:1px solid #e5e7eb;"></td></tr>
          </table>
        </td></tr>

        <!-- Social links -->
        <tr><td align="center" style="padding:20px 0 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" class="footer-social">
            <tr>
              <td style="padding:0 10px;">
                <a href="https://x.com/becandidio" target="_blank" style="text-decoration:none;">
                  <img class="social-icon" src="https://becandid.io/email/icon-x.png" alt="X (Twitter)" width="20" height="20" style="display:block;width:20px;height:20px;opacity:0.45;" />
                </a>
              </td>
              <td style="padding:0 10px;">
                <a href="https://www.instagram.com/becandidio" target="_blank" style="text-decoration:none;">
                  <img class="social-icon" src="https://becandid.io/email/icon-instagram.png" alt="Instagram" width="20" height="20" style="display:block;width:20px;height:20px;opacity:0.45;" />
                </a>
              </td>
              <td style="padding:0 10px;">
                <a href="https://www.linkedin.com/company/becandid" target="_blank" style="text-decoration:none;">
                  <img class="social-icon" src="https://becandid.io/email/icon-linkedin.png" alt="LinkedIn" width="20" height="20" style="display:block;width:20px;height:20px;opacity:0.45;" />
                </a>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Referral CTA -->
        <tr><td style="padding:16px 0 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#f0fafb 0%,#e8f4f8 100%);border:1px solid #d1e9ef;border-radius:12px;">
            <tr><td style="padding:16px 20px;text-align:center;">
              <p style="margin:0 0 8px;color:#226779;font-size:14px;font-weight:700;line-height:1.4;">Know someone who could use Be Candid?</p>
              <p style="margin:0 0 12px;color:#6b7280;font-size:12px;line-height:1.5;">Share the gift of digital accountability with a friend or partner.</p>
              <a href="${APP_URL}/dashboard/referrals" target="_blank" style="display:inline-block;background:#226779;color:#ffffff;padding:10px 24px;border-radius:100px;text-decoration:none;font-weight:600;font-size:13px;">Invite a Friend</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer links -->
        <tr><td style="text-align:center;">
          <p class="text-footer" style="margin:0 0 6px;color:#9ca3af;font-size:11px;line-height:1.6;">
            Be Candid &mdash; <a href="${APP_URL}" style="color:#9ca3af;text-decoration:underline;">becandid.io</a>
          </p>
          <p class="text-footer" style="margin:0 0 16px;color:#9ca3af;font-size:11px;line-height:1.6;">
            <a href="${APP_URL}/dashboard/notifications" style="color:#9ca3af;text-decoration:underline;">Manage notifications</a>
            &nbsp;&middot;&nbsp;
            <a href="${APP_URL}/unsubscribe" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
          </p>
        </td></tr>

        <!-- Crisis support bar -->
        <tr><td style="padding:0 0 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="crisis-bar" style="background-color:#f0f9ff;border:1px solid #e0f2fe;border-radius:10px;">
            <tr><td style="padding:12px 16px;text-align:center;">
              <p class="crisis-bar-text" style="margin:0;color:#64748b;font-size:11px;line-height:1.6;">
                If you or someone you know is in crisis, call or text
                <a href="tel:988" class="crisis-bar-link" style="color:#226779;font-weight:700;text-decoration:none;">988</a>
                (Suicide &amp; Crisis Lifeline) or text
                <strong>HOME</strong> to
                <a href="sms:741741" class="crisis-bar-link" style="color:#226779;font-weight:700;text-decoration:none;">741741</a>
                (Crisis Text Line).
              </p>
            </td></tr>
          </table>
        </td></tr>

      </table>

    </td></tr>
  </table>
</body>
</html>`;
}
