// extend process type

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      LINEAR_API_KEY: string;
      GITHUB_TOKEN: string;
    }
  }
}

export {};
