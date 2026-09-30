const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// NativeWind's CSS module and Babel runtime must share one copy of
// react-native-css-interop. pnpm can resolve a second copy for imports that come from
// the project root, which leaves the compiled styles registered in one instance while
// `className` is applied through the other. Resolving the package through nativewind's
// own dependency keeps a single instance.
const nativewindPackageDir = path.dirname(require.resolve('nativewind/package.json'));

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'react-native-css-interop' ||
    moduleName.startsWith('react-native-css-interop/')
  ) {
    return context.resolveRequest(
      { ...context, originModulePath: path.join(nativewindPackageDir, 'package.json') },
      moduleName,
      platform,
    );
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
