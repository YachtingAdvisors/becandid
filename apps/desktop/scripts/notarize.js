// ============================================================
// scripts/notarize.js
//
// Called by electron-builder after signing the macOS app.
// Submits the app to Apple's notarization service.
//
// Required environment variables:
//   APPLE_ID               — your Apple ID (slaser90@gmail.com)
//   APPLE_APP_SPECIFIC_PASSWORD — app-specific password from appleid.apple.com
//   APPLE_TEAM_ID          — your team ID (TH92H9399U)
// ============================================================

const { notarize } = require('@electron/notarize');
const path = require('path');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  // Only notarize macOS builds
  if (electronPlatformName !== 'darwin') {
    console.log('Skipping notarization — not a macOS build');
    return;
  }

  // Check for required environment variables
  if (!process.env.APPLE_ID || !process.env.APPLE_APP_SPECIFIC_PASSWORD || !process.env.APPLE_TEAM_ID) {
    console.warn(
      'Skipping notarization — missing environment variables.\n' +
      'Set APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, and APPLE_TEAM_ID to enable.'
    );
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  console.log(`Notarizing ${appPath}...`);

  await notarize({
    appBundleId: 'io.becandid.desktop',
    appPath,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  });

  console.log('Notarization complete!');
};
