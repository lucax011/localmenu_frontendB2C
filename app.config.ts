import 'dotenv/config';

export default ({ config }: any) => ({
  ...config,
  name: 'LocalMenu',
  slug: 'localmenu-b2c',
  version: '0.1.0',
  scheme: 'localmenu',
  orientation: 'portrait',
  ios: { supportsTablet: true },
  web: { bundler: 'metro', output: 'single' },
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
    eas: { projectId: 'localmenu-b2c-local' },
  },
});
