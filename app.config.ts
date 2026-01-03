import 'dotenv/config';

export default ({ config }: { config: any }) => {
  return {
    ...config,
    extra: {
      ...(config.extra ?? {}),
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
    },
  };
};

