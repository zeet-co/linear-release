declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GITHUB_REPO?: string;
      GITHUB_OWNER?: string;
    }
  }
}

export {};
