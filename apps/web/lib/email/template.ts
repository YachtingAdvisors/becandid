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
          <a href="${ctaUrl}" target="_blank" style="display:inline-block;background:#226779;color:#ffffff;padding:14px 32px;border-radius:100px;text-decoration:none;font-weight:700;font-size:15px;line-height:1.2;mso-padding-alt:0;">
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
      .bg-header { background-color:#1b3a44 !important; }
      .text-heading { color:#e2e8f0 !important; }
      .text-body { color:#cbd5e1 !important; }
      .text-muted { color:#94a3b8 !important; }
      .text-footer { color:#64748b !important; }
      .cta-btn { background-color:#2d8a9e !important; }
      .divider { border-color:#3a3a5c !important; }
    }

    @media only screen and (max-width: 560px) {
      .container { width:100% !important; padding:16px !important; }
      .card { padding:24px 20px !important; }
      .header-pill { padding:5px 14px !important; font-size:11px !important; }
    }
  </style>
</head>
<body class="bg-body" style="margin:0;padding:0;background-color:#f9fafb;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  ${preheader ? `<div style="display:none;font-size:1px;color:#f9fafb;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}${'&#847; &zwnj; &nbsp; '.repeat(30)}</div>` : ''}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;" class="bg-body">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" class="container" style="max-width:520px;width:100%;">

        <!-- Logo header -->
        <tr><td align="center" style="padding-bottom:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td class="bg-header" style="background-color:#226779;padding:6px 18px;border-radius:100px;">
                <span class="header-pill" style="color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Be Candid</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Card body -->
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-card card" style="background-color:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">
            <tr><td style="padding:32px 28px;">
              ${body}
              ${ctaBlock}
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:20px;text-align:center;">
          ${footerNoteBlock}
          <p class="text-footer" style="margin:8px 0 0;color:#9ca3af;font-size:11px;line-height:1.6;">
            Be Candid &mdash; <a href="${APP_URL}" style="color:#9ca3af;text-decoration:underline;">becandid.io</a><br/>
            <a href="${APP_URL}/dashboard/notifications" style="color:#9ca3af;text-decoration:underline;">Manage notifications</a>
            &nbsp;&middot;&nbsp;
            <a href="${APP_URL}/unsubscribe" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
