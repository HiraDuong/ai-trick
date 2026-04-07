// Luvina
// Vu Huy Hoang - Dev2
import type { AuthenticatedUser } from "./auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};