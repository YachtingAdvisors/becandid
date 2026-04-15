const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Force Metro to resolve from the mobile workspace first,
// preventing React 18 (root) from overriding React 19 (mobile)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Block the root monorepo's React 18 from being resolved.
// Metro walks up from each file's directory and can find root/node_modules/react (18)
// before checking nodeModulesPaths. This blocklist forces all react resolution through
// the mobile workspace's React 19.
config.resolver.blockList = [
  new RegExp(monorepoRoot + '/node_modules/react/.*'),
  new RegExp(monorepoRoot + '/node_modules/react-dom/.*'),
];

// Watch the monorepo root for shared packages
config.watchFolders = [monorepoRoot];

module.exports = config;
