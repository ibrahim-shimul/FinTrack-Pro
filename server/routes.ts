import type { Express } from "express";
import { createServer, type Server } from "node:http";
import * as path from "node:path";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get('/api/download-keystore', (_req, res) => {
    const filePath = path.resolve(process.cwd(), 'expensedaddy.jks');
    res.download(filePath, 'expensedaddy.jks');
  });

  const httpServer = createServer(app);
  return httpServer;
}
