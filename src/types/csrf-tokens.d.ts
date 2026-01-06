declare module 'csrf-tokens' {
  export class Tokens {
    constructor(options?: { secretLength?: number; saltLength?: number });

    secretSync(): string;
    create(secret: string): string;
    verify(secret: string, token: string): boolean;
  }
}
