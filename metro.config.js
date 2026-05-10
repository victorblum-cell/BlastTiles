const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Explicitly resolve packages that Metro struggles to find on Windows
// when the project path contains spaces
const nodeModules = path.resolve(projectRoot, 'node_modules');
config.resolver.nodeModulesPaths = [nodeModules];
config.resolver.extraNodeModules = {
  'react-native-safe-area-context': path.resolve(nodeModules, 'react-native-safe-area-context'),
  'react-native-screens': path.resolve(nodeModules, 'react-native-screens'),
  '@react-native-async-storage/async-storage': path.resolve(nodeModules, '@react-native-async-storage/async-storage'),
};

config.watchFolders = [projectRoot];

module.exports = config;
