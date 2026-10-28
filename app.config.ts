import 'dotenv/config';

export default ({ config }: any) => ({
  ...config,
  name: 'LocalMenu',
  slug: 'localmenu-b2c',
  version: '0.1.0',
  scheme: 'localmenu',
  orientation: 'portrait',
  ios: { supportsTablet: true },
  // PWA: public/index.html, public/manifest.webmanifest e public/sw.js completam a parte web
  web: {
    bundler: 'metro',
    output: 'single',
    lang: 'pt-BR',
    name: 'LocalMenu',
    shortName: 'LocalMenu',
    themeColor: '#C2410C',
    backgroundColor: '#FBF7F2',
  },
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
    eas: { projectId: 'localmenu-b2c-local' },
  },
});
