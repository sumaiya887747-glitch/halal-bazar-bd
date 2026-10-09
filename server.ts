import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_FILE = path.join(__dirname, 'data_store.json');

// Helper to load persisted data
function loadData() {
  if (fs.existsSync(STORE_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
      return {
        orders: data.orders || [],
        submissions: data.submissions || [],
        testimonials: data.testimonials || [],
        products: data.products || null,
        settings: data.settings || null,
      };
    } catch (e) {
      console.error('Failed to parse store file, resetting:', e);
    }
  }
  return { orders: [], submissions: [], testimonials: [], products: null, settings: null };
}

// Helper to save persisted data
function saveData(data: any) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save store file:', e);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Memory/File Storage
  let store = loadData();

  // SSE Clients storage
  const sseClients = new Set<express.Response>();

  function broadcastStore() {
    const data = `data: ${JSON.stringify(store)}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(data);
      } catch (e) {
        sseClients.delete(client);
      }
    }
  }

  // SSE Keep-alive heartbeat every 15s to keep connections alive across reverse proxies
  setInterval(() => {
    for (const client of sseClients) {
      try {
        client.write(': keep-alive\n\n');
      } catch (e) {
        sseClients.delete(client);
      }
    }
  }, 15000);

  // Real-time SSE Endpoint
  app.get('/api/events', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(`data: ${JSON.stringify(store)}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // API Endpoints
  app.get('/api/sync', (req, res) => {
    res.json(store);
  });

  app.post('/api/products/update', (req, res) => {
    const { products } = req.body;
    if (Array.isArray(products)) {
      store.products = products;
      saveData(store);
      broadcastStore();
    }
    res.json({ success: true, products: store.products });
  });

  app.post('/api/settings/update', (req, res) => {
    const { settings } = req.body;
    if (settings && typeof settings === 'object') {
      store.settings = settings;
      saveData(store);
      broadcastStore();
    }
    res.json({ success: true, settings: store.settings });
  });

  app.post('/api/orders', (req, res) => {
    const { order } = req.body;
    if (order) {
      // Avoid duplicate order IDs
      const exists = store.orders.some((o: any) => o.id === order.id);
      if (!exists) {
        store.orders = [order, ...store.orders];
        saveData(store);
        broadcastStore();
      }
    }
    res.json({ success: true, orders: store.orders });
  });

  app.post('/api/orders/update', (req, res) => {
    const { orders } = req.body;
    if (Array.isArray(orders)) {
      store.orders = orders;
      saveData(store);
      broadcastStore();
    }
    res.json({ success: true, orders: store.orders });
  });

  app.post('/api/submissions', (req, res) => {
    const { submission } = req.body;
    if (submission) {
      // Avoid duplicates
      const exists = store.submissions.some((s: any) => s.id === submission.id);
      if (!exists) {
        store.submissions = [submission, ...store.submissions];
        saveData(store);
        broadcastStore();
      }
    }
    res.json({ success: true, submissions: store.submissions });
  });

  app.post('/api/submissions/update', (req, res) => {
    const { submissions } = req.body;
    if (Array.isArray(submissions)) {
      store.submissions = submissions;
      saveData(store);
      broadcastStore();
    }
    res.json({ success: true, submissions: store.submissions });
  });

  app.post('/api/testimonials', (req, res) => {
    const { testimonial } = req.body;
    if (testimonial) {
      // Avoid duplicate reviews
      const exists = store.testimonials.some((t: any) => t.id === testimonial.id);
      if (!exists) {
        store.testimonials = [testimonial, ...store.testimonials];
        saveData(store);
        broadcastStore();
      }
    }
    res.json({ success: true, testimonials: store.testimonials });
  });

  app.post('/api/testimonials/update', (req, res) => {
    const { testimonials } = req.body;
    if (Array.isArray(testimonials)) {
      store.testimonials = testimonials;
      saveData(store);
      broadcastStore();
    }
    res.json({ success: true, testimonials: store.testimonials });
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development Mode with Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Production Mode
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}

startServer();
