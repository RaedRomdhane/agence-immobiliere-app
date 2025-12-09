const client = require('prom-client');
const mongoose = require('mongoose');

// Create a registry which we will expose
const register = new client.Registry();

// Collect default metrics (CPU, memory, event loop, etc.) with prefix
client.collectDefaultMetrics({ register, prefix: 'app_' });

// HTTP request duration histogram
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

register.registerMetric(httpRequestDurationSeconds);

// MongoDB connection gauge
const mongodbConnectionsGauge = new client.Gauge({
  name: 'mongodb_connections_current',
  help: 'Current number of MongoDB connections',
  async collect() {
    try {
      if (mongoose.connection.readyState === 1) {
        const adminDb = mongoose.connection.db.admin();
        const serverStatus = await adminDb.serverStatus();
        this.set(serverStatus.connections.current || 0);
      }
    } catch (err) {
      console.debug('Failed to collect MongoDB metrics:', err.message);
    }
  }
});

register.registerMetric(mongodbConnectionsGauge);

function metricsMiddleware(req, res, next) {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const seconds = diff[0] + diff[1] / 1e9;
    const route = req.route && req.route.path ? req.route.path : req.path;
    try {
      httpRequestDurationSeconds.labels(req.method, route, String(res.statusCode)).observe(seconds);
    } catch (err) {
      // silently ignore metric errors
      // eslint-disable-next-line no-console
      console.debug('Metric observe failed', err && err.message);
    }
  });

  next();
}

module.exports = { register, metricsMiddleware };
