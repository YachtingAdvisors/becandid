const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Expo config plugin that fixes React version resolution for monorepo builds.
 *
 * Problem: In this monorepo, the root node_modules has React 18.3.1 (for
 * apps/web) while apps/mobile needs React 19.0.0 (Expo SDK 53 / RN 0.79).
 * When Metro bundles the Android app via Gradle, it can resolve React from
 * the monorepo root instead of the mobile workspace, causing a crash:
 *   TypeError: Cannot read property 'useRef' of null
 *
 * This plugin modifies android/app/build.gradle to:
 * 1. Explicitly set `root = file("../")` so the Gradle bundle task runs
 *    Metro from apps/mobile (where metro.config.js lives).
 * 2. Add `extraPackagerArgs = ["--reset-cache"]` so Metro does not reuse
 *    stale cached module resolution that points to the wrong React version.
 */
function withMonorepoReactFix(config) {
  return withAppBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;

    // 1. Set root = file("../") in the react {} block.
    //    The default convention resolves to the same path, but being explicit
    //    prevents any ambiguity and makes the monorepo setup clear.
    if (!buildGradle.includes('root = file("../")')) {
      buildGradle = buildGradle.replace(
        /bundleCommand\s*=\s*"export:embed"/,
        `bundleCommand = "export:embed"

    // Monorepo fix: explicitly set project root to apps/mobile so the
    // Gradle bundle task resolves React 19 from apps/mobile/node_modules.
    root = file("../")

    // Clear Metro resolver cache to avoid stale React 18 resolution.
    extraPackagerArgs = ["--reset-cache"]`
      );
    }

    config.modResults.contents = buildGradle;
    return config;
  });
}

module.exports = withMonorepoReactFix;
