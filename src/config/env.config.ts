export const EnvConfiguration = () => ({
  enviroment: process.env.NODE_ENV,
  hostapi: process.env.HOST_API,
  defaultLimitPage: +process.env.DEFAULT_LIMIT_PAGE || 10,
});
