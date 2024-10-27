// src/utils/logger.ts

export const getLogger = (context: string) => {
  return {
    log: (...args: any[]) => {
      if (process.env.REACT_APP_DEBUG === 'true') {
        console.log(`[${context}]`, ...args);
      }
    },
    error: (...args: any[]) => {
      if (process.env.REACT_APP_DEBUG === 'true') {
        console.error(`[${context}]`, ...args);
      }
    },
  };
};
