declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string;
      KILL_MAIL_CHANNEL_ID: string;
      EVE_API_BASE_URL: string;
      EVE_IMAGE_CDN_BASE_URL: string;
      EVE_CORPORATION_ID: string;
      SEAT_DB_HOST: string;
      SEAT_DB_DATABASE: string;
      SEAT_DB_USER: string;
      SEAT_DB_PASS: string;
      SEAT_DB_PORT: string;
    }
  }
}

// // If this file has no import/export statements (i.e. is a script)
// // convert it into a module by adding an empty export statement.
export {};
