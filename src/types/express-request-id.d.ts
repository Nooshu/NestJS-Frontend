declare module 'express-request-id' {
  import { RequestHandler } from 'express';

  interface RequestIdOptions {
    uuidVersion?: 'v1' | 'v4';
    setHeader?: boolean;
    headerName?: string;
    attributeName?: string;
  }

  function requestId(options?: RequestIdOptions): RequestHandler;
  export = requestId;
} 