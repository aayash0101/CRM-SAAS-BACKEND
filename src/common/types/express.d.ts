declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: string;
      organizationId: string;
      firstName: string;
      lastName: string;
    };
  }
}