# Metrics Instrumentation Guide

This document explains how to add detailed metrics instrumentation to your existing API routes and components.

## Basic Metrics Already Exposed

The basic HTTP metrics are automatically collected without any code changes:
- `http_requests_total` - Total requests by method, route, status
- `http_request_duration_seconds` - Request duration histogram
- Request rate is calculated from the above

## Optional: Add Business Metrics to Your Routes

To capture detailed business metrics, add these functions to your API routes:

### 1. Cart Operations

**File**: `app/api/orders/route.ts` (or wherever you handle cart operations)

```typescript
import { recordCartOperation, recordCheckoutAttempt } from '@/lib/metrics';

export async function POST(request: NextRequest) {
  try {
    // ... your cart logic ...

    recordCartOperation('add', 'success');
    return NextResponse.json({ success: true });
  } catch (error) {
    recordCartOperation('add', 'error');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 2. Product Views

**File**: `app/page.tsx` (or product detail page)

```typescript
import { recordProductView } from '@/lib/metrics';

export default function ProductPage({ params }) {
  useEffect(() => {
    // Record product view when component mounts
    recordProductView(params.productId);
  }, [params.productId]);

  return (
    // ... your component ...
  );
}
```

### 3. Checkout Tracking

**File**: `app/checkout/page.tsx`

```typescript
import { recordCheckoutAttempt } from '@/lib/metrics';

export default function CheckoutPage() {
  const handleCheckoutStart = () => {
    recordCheckoutAttempt('started');
  };

  const handleCheckoutSuccess = async () => {
    try {
      // ... checkout logic ...
      recordCheckoutAttempt('success');
    } catch (error) {
      recordCheckoutAttempt('failed');
    }
  };

  return (
    // ... your checkout form ...
  );
}
```

### 4. Database Query Metrics

**File**: `lib/database.ts` (or wherever you query the database)

```typescript
import { recordDatabaseQuery } from '@/lib/metrics';

export async function getProducts() {
  const startTime = Date.now();

  try {
    const products = db.prepare('SELECT * FROM products').all();
    const duration = Date.now() - startTime;

    recordDatabaseQuery('getProducts', duration);
    return products;
  } catch (error) {
    const duration = Date.now() - startTime;
    recordDatabaseQuery('getProducts_error', duration);
    throw error;
  }
}
```

## Middleware for Automatic HTTP Metrics

To automatically track response times and status codes, add this middleware:

**File**: `lib/middleware.ts` (create if doesn't exist)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { recordHttpMetrics } from '@/lib/metrics';

export function withMetrics(handler: any) {
  return async (request: NextRequest) => {
    const startTime = Date.now();
    const method = request.method;
    const route = request.nextUrl.pathname;

    try {
      const response = await handler(request);
      const duration = Date.now() - startTime;

      recordHttpMetrics(
        method,
        route,
        response.status,
        duration
      );

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      recordHttpMetrics(method, route, 500, duration);
      throw error;
    }
  };
}
```

Then use it in your API routes:

```typescript
import { withMetrics } from '@/lib/middleware';

export const POST = withMetrics(async (request) => {
  // Your handler logic
});
```

## Custom Metrics

To add custom metrics for business logic:

```typescript
import { writeMetricToInfluxDB } from '@/lib/metrics';

// Record custom event
await writeMetricToInfluxDB(
  'order_completed',
  {
    total_amount: 99.99,
    items_count: 3
  },
  {
    user_tier: 'premium',
    source: 'mobile'
  }
);

// Record feature usage
await writeMetricToInfluxDB(
  'feature_used',
  { count: 1 },
  {
    feature: 'wishlist',
    user_segment: 'returning'
  }
);
```

## Grafana Queries for Custom Metrics

Once you've added custom metrics, create Grafana panels with these queries:

### Average Order Value
```promql
avg(order_completed_total_amount)
```

### Orders per Hour
```promql
rate(order_completed_count[1h])
```

### Feature Usage by Type
```promql
rate(feature_used_count[5m]) by (feature)
```

### User Tier Distribution
```promql
order_completed_items_count by (user_tier)
```

## Performance Considerations

### 1. Avoid High-Cardinality Labels

❌ **Bad**: Adding unique IDs as labels
```typescript
recordHttpMetrics(method, `/product/${productId}`, status, duration);
// This creates a new metric for each product!
```

✅ **Good**: Group similar routes
```typescript
recordHttpMetrics(method, '/product/:id', status, duration);
```

### 2. Batch Writes to InfluxDB

```typescript
// Instead of writing on every request
const metrics = [];

app.use((req, res, next) => {
  metrics.push({
    timestamp: new Date(),
    endpoint: req.path,
    status: res.statusCode
  });

  if (metrics.length >= 100) {
    // Flush to InfluxDB
    flushMetrics(metrics);
    metrics = [];
  }
  next();
});
```

### 3. Sample High-Volume Events

```typescript
// Only record 10% of requests to save storage
if (Math.random() < 0.1) {
  recordHttpMetrics(method, route, status, duration);
}
```

## Common Metrics to Track

### E-commerce Metrics
```typescript
// Product metrics
recordProductView(productId);
recordProductSearched(searchTerm);

// Cart metrics
recordCartOperation('add', status);
recordCartOperation('remove', status);
recordCartAbandon(cartValue);

// Checkout metrics
recordCheckoutAttempt('started');
recordCheckoutAttempt('success');
recordCheckoutAttempt('failed');
recordCheckoutStep(step, completed);

// Order metrics
recordOrderPlaced(orderId, totalAmount);
recordOrderCancelled(orderId);
```

### Performance Metrics
```typescript
// Page load metrics
recordPageLoad('/products', loadTime);
recordPageLoad('/checkout', loadTime);

// API metrics
recordApiLatency('/api/products', responseTime);
recordApiErrors('/api/products', errorType);

// Search metrics
recordSearchQuery(query);
recordSearchResults(query, resultCount);
```

### User Behavior Metrics
```typescript
// User activity
recordUserLogin(userId);
recordUserLogout(userId);
recordSessionStart(userId);
recordSessionEnd(userId, duration);

// Feature usage
recordFeatureUsed(featureName);
recordUserSegment(userId, segment);
```

## Debugging Metrics

### View Raw Metrics

```bash
# See all available metrics
curl http://localhost:3000/api/metrics

# Filter specific metrics
curl http://localhost:3000/api/metrics | grep http_requests
curl http://localhost:3000/api/metrics | grep cart_operations
```

### Check Metrics in Prometheus

1. Visit http://localhost:9090
2. Search for metric names:
   - `http_requests_total`
   - `cart_operations_total`
   - `product_views_total`
   - `checkout_attempts_total`

### Query in Prometheus

```promql
# All metrics for cart operations
{__name__=~"cart.*"}

# By status
cart_operations_total{status="success"}

# Rate of change
rate(cart_operations_total[5m])

# Success percentage
rate(cart_operations_total{status="success"}[5m]) / rate(cart_operations_total[5m]) * 100
```

## Testing Metrics

Create a test script to generate sample metrics:

```bash
#!/bin/bash

# Generate homepage traffic
for i in {1..10}; do
  curl -s http://localhost:3000 > /dev/null
done

# Generate product views
for i in {1..5}; do
  curl -s http://localhost:3000/products > /dev/null
done

# Generate API calls
for i in {1..3}; do
  curl -s http://localhost:3000/api/products > /dev/null
done

echo "Metrics generated. Check http://localhost:3001"
```

## Next Steps

1. **Add basic metrics** to your most critical endpoints
2. **Create dashboards** in Grafana to visualize them
3. **Set up alerts** for anomalies
4. **Monitor trends** over time to identify patterns
5. **Optimize** based on metrics insights

## Related Files

- `lib/metrics.ts` - Metrics library
- `app/api/metrics/route.ts` - Metrics endpoint
- `app/api/health/route.ts` - Health check
- `MONITORING.md` - Complete monitoring guide
- `MONITORING_SETUP.md` - Quick start guide
