const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo config plugin that adds PACKAGE_USAGE_STATS permission
 * to AndroidManifest.xml with tools:ignore="ProtectedPermissions".
 *
 * Note: The module's own AndroidManifest.xml already declares this
 * permission, so this plugin serves as an extra safety net and
 * ensures the permission merges correctly during prebuild.
 */
function withUsageStatsPermission(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // Ensure xmlns:tools is present
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    // Check if permission already exists
    const permissions = manifest['uses-permission'] || [];
    const exists = permissions.some(
      (p) => p.$?.['android:name'] === 'android.permission.PACKAGE_USAGE_STATS'
    );

    if (!exists) {
      permissions.push({
        $: {
          'android:name': 'android.permission.PACKAGE_USAGE_STATS',
          'tools:ignore': 'ProtectedPermissions',
        },
      });
      manifest['uses-permission'] = permissions;
    }

    return config;
  });
}

module.exports = withUsageStatsPermission;
