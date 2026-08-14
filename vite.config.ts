import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import handler from './api/data.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'api-emulator',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.startsWith('/api/data')) {
            res.setHeader('Content-Type', 'application/json');

            let body = {};
            if (req.method === 'POST') {
              const buffers = [];
              for await (const chunk of req) {
                buffers.push(chunk);
              }
              const rawBody = Buffer.concat(buffers).toString();
              try {
                if (rawBody) {
                  body = JSON.parse(rawBody);
                }
              } catch (e) {
                console.error("Failed to parse POST body in emulator:", e);
              }
            }

            const mockRes = {
              statusCode: 200,
              headers: {} as Record<string, string>,
              setHeader(name: string, value: string) {
                this.headers[name] = value;
                res.setHeader(name, value);
                return this;
              },
              status(code: number) {
                this.statusCode = code;
                res.statusCode = code;
                return this;
              },
              json(data: any) {
                res.end(JSON.stringify(data));
                return this;
              },
              end() {
                res.end();
                return this;
              }
            };

            const mockReq = {
              method: req.method,
              body: body
            };

            try {
              await handler(mockReq as any, mockRes as any);
            } catch (err: any) {
              console.error("Local API Error:", err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message || 'Internal server error in emulator' }));
            }
            return;
          }
          next();
        });
      }
    }
  ],
})

