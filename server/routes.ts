import type { Express } from "express";
import { createServer, type Server } from "node:http";
import * as path from "node:path";
import * as fs from "node:fs";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get('/api/download-keystore', (_req, res) => {
    const filePath = path.resolve(process.cwd(), 'expensedaddy.jks');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Keystore file not found');
    }

    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString('base64');
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head><title>Download Keystore</title></head>
    <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #1a1a1a; color: white;">
      <div style="text-align: center;">
        <h2>Keystore File Download</h2>
        <p>Click the button below to download your keystore file.</p>
        <a id="dl" download="expensedaddy.jks" style="display: inline-block; padding: 16px 32px; background: #4CAF50; color: white; text-decoration: none; border-radius: 8px; font-size: 18px; cursor: pointer;">Download expensedaddy.jks</a>
        <script>
          const b64 = "${base64Data}";
          const byteChars = atob(b64);
          const byteNumbers = new Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) {
            byteNumbers[i] = byteChars.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {type: 'application/octet-stream'});
          document.getElementById('dl').href = URL.createObjectURL(blob);
        </script>
      </div>
    </body>
    </html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  const httpServer = createServer(app);
  return httpServer;
}
