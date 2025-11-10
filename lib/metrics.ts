import { register, Counter, Histogram, Gauge } from 'prom-client';

// Initialize Prometheus metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

export const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  labelNames: ['type']
});

export const cartOperations = new Counter({
  name: 'cart_operations_total',
  help: 'Total number of cart operations',
  labelNames: ['operation', 'status']
});

export const productViews = new Counter({
  name: 'product_views_total',
  help: 'Total number of product views',
  labelNames: ['product_id']
});

export const checkoutAttempts = new Counter({
  name: 'checkout_attempts_total',
  help: 'Total number of checkout attempts',
  labelNames: ['status']
});

export const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['query_type'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1]
});

export const databaseConnections = new Gauge({
  name: 'database_connections',
  help: 'Number of active database connections',
  labelNames: ['status']
});

// InfluxDB client removed - metrics are exposed via Prometheus endpoint
// If you need InfluxDB integration later, add @influxdata/influxdb-client package

// Record HTTP metrics
export function recordHttpMetrics(
  method: string,
  route: string,
  status: number,
  duration: number
) {
  httpRequestCounter.inc({
    method,
    route,
    status: status.toString()
  });

  httpRequestDuration.observe(
    {
      method,
      route,
      status: status.toString()
    },
    duration / 1000 // Convert to seconds
  );
}

// Record cart operations
export function recordCartOperation(operation: string, status: 'success' | 'error') {
  cartOperations.inc({ operation, status });
}

// Record product views
export function recordProductView(productId: string | number) {
  productViews.inc({ product_id: productId.toString() });
}

// Record checkout attempts
export function recordCheckoutAttempt(status: 'success' | 'failed' | 'started') {
  checkoutAttempts.inc({ status });
}

// Record database query metrics
export function recordDatabaseQuery(queryType: string, duration: number) {
  databaseQueryDuration.observe({ query_type: queryType }, duration / 1000);
}

// Get all metrics in Prometheus format
export async function getMetrics(): Promise<string> {
  return register.metrics();
}
