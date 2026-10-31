const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('node:path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);
const config = {
  watchFolders: [
    ...defaultConfig.watchFolders,
    path.resolve(__dirname, '..', 'shared'),
  ],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      ...defaultConfig.resolver.nodeModulesPaths,
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);
