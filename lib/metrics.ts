import { register, Counter, Histogram, Gauge } from 'prom-client';
import { InfluxDB, Point } from '@influxdata/influxdb-client';

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

// Initialize InfluxDB client
let influxClient: any;

export function initializeInfluxDB() {
  if (process.env.INFLUXDB_URL) {
    const { InfluxDB: InfluxDBClient } = require('@influxdata/influxdb-client');

    influxClient = new InfluxDBClient({
      url: process.env.INFLUXDB_URL || 'http://influxdb:8086',
      token: process.env.INFLUXDB_TOKEN,
      org: process.env.INFLUXDB_ORG || 'ru2ya',
      bucket: process.env.INFLUXDB_BUCKET || 'metrics'
    });
  }
}

// Write metrics to InfluxDB
export async function writeMetricToInfluxDB(
  measurement: string,
  fields: Record<string, number>,
  tags: Record<string, string> = {}
) {
  if (!influxClient) return;

  try {
    const writeApi = influxClient.getWriteApi(
      process.env.INFLUXDB_ORG || 'ru2ya',
      process.env.INFLUXDB_BUCKET || 'metrics'
    );

    const point = new Point(measurement)
      .timestamp(new Date());

    Object.entries(tags).forEach(([key, value]) => {
      point.tag(key, value);
    });

    Object.entries(fields).forEach(([key, value]) => {
      point.floatField(key, value);
    });

    writeApi.writePoint(point);
    await writeApi.close();
  } catch (error) {
    console.error('Error writing to InfluxDB:', error);
  }
}

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

  writeMetricToInfluxDB('http_request', { duration_ms: duration, status }, {
    method,
    route
  });
}

// Record cart operations
export function recordCartOperation(operation: string, status: 'success' | 'error') {
  cartOperations.inc({ operation, status });
  writeMetricToInfluxDB('cart_operation', { count: 1 }, {
    operation,
    status
  });
}

// Record product views
export function recordProductView(productId: string | number) {
  productViews.inc({ product_id: productId.toString() });
  writeMetricToInfluxDB('product_view', { count: 1 }, {
    product_id: productId.toString()
  });
}

// Record checkout attempts
export function recordCheckoutAttempt(status: 'success' | 'failed' | 'started') {
  checkoutAttempts.inc({ status });
  writeMetricToInfluxDB('checkout_attempt', { count: 1 }, { status });
}

// Record database query metrics
export function recordDatabaseQuery(queryType: string, duration: number) {
  databaseQueryDuration.observe({ query_type: queryType }, duration / 1000);
  writeMetricToInfluxDB('database_query', { duration_ms: duration }, {
    query_type: queryType
  });
}

// Get all metrics in Prometheus format
export function getMetrics() {
  return register.metrics();
}
