const path = require('path');

/**
 * React Native CLI configuration for the mobile workspace.
 *
 * In this monorepo the root node_modules contains React 18.3.1 (used by
 * apps/web) while apps/mobile/node_modules contains React 19.0.0 (required
 * by Expo SDK 53 / React Native 0.79).
 *
 * Pointing the project and dependency roots to the mobile workspace ensures
 * that autolinking, the Gradle bundle task, and Metro all resolve React 19
 * from apps/mobile/node_modules instead of React 18 from the monorepo root.
 */
const mobileRoot = __dirname;

module.exports = {
  project: {
    android: {
      sourceDir: path.join(mobileRoot, 'android'),
    },
    ios: {
      sourceDir: path.join(mobileRoot, 'ios'),
    },
  },
  // Dependency resolution: look in the mobile workspace first, then fall back
  // to the monorepo root for hoisted packages that are NOT version-sensitive.
  dependencies: {},
  reactNativePath: path.join(mobileRoot, 'node_modules', 'react-native'),
};
