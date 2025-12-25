# Scaling Guide

## Overview

This guide covers horizontal scaling strategies for the TeleMedicine AI Agent package to handle large-scale deployments.

## Architecture Options

### 1. Single Instance (Development)
```
┌──────────────┐
│  TelemedAgent│
│  (1 instance)│
└──────────────┘
```
**Capacity**: 1,000 concurrent users  
**Use Case**: Development, small clinics

---

### 2. Load Balanced (Production)
```
        ┌─────────────────┐
        │  Load Balancer  │
        └────────┬────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌────────┐  ┌────────┐  ┌────────┐
│Agent-1 │  │Agent-2 │  │Agent-N │
└────────┘  └────────┘  └────────┘
```
**Capacity**: 10,000+ concurrent users  
**Use Case**: Medium to large healthcare organizations

---

### 3. Distributed with Shared Cache
```
        ┌─────────────────┐
        │  Load Balancer  │
        └────────┬────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌────────┐  ┌────────┐  ┌────────┐
│Agent-1 │  │Agent-2 │  │Agent-N │
└───┬────┘  └───┬────┘  └───┬────┘
    └───────────┼────────────┘
                ▼
        ┌──────────────┐
        │ Redis Cache  │
        └──────────────┘
```
**Capacity**: 50,000+ concurrent users  
**Use Case**: Enterprise, multi-region deployments

---

## Deployment Strategies

### Docker Deployment

**Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY dist ./dist
COPY node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

**docker-compose.yml** (Load Balanced):
```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - agent1
      - agent2
      - agent3

  agent1:
    build: .
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M

  agent2:
    build: .
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M

  agent3:
    build: .
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

---

### Kubernetes Deployment

**deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: telemed-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: telemed-agent
  template:
    metadata:
      labels:
        app: telemed-agent
    spec:
      containers:
      - name: agent
        image: telemed-agent:latest
        ports:
        - containerPort: 3000
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: telemed-secrets
              key: openai-api-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "500m"
          limits:
            memory: "512Mi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: telemed-agent-service
spec:
  selector:
    app: telemed-agent
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: telemed-agent-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: telemed-agent
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## Load Balancer Configuration

### NGINX Configuration

```nginx
upstream telemed_agents {
    least_conn;
    server agent1:3000 weight=1;
    server agent2:3000 weight=1;
    server agent3:3000 weight=1;
}

server {
    listen 80;
    server_name telemed.example.com;

    location / {
        proxy_pass http://telemed_agents;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Health checks
        proxy_next_upstream error timeout http_500 http_502 http_503;
    }

    location /health {
        proxy_pass http://telemed_agents/health;
        access_log off;
    }
}
```

---

## Auto-Scaling

### AWS Auto Scaling Group

```json
{
  "AutoScalingGroupName": "telemed-agent-asg",
  "MinSize": 2,
  "MaxSize": 10,
  "DesiredCapacity": 3,
  "HealthCheckType": "ELB",
  "HealthCheckGracePeriod": 300,
  "TargetGroupARNs": ["arn:aws:elasticloadbalancing:..."],
  "Tags": [
    {
      "Key": "Name",
      "Value": "telemed-agent"
    }
  ]
}
```

### Scaling Policies

**CPU-Based Scaling**:
```json
{
  "PolicyName": "cpu-scale-out",
  "AdjustmentType": "ChangeInCapacity",
  "ScalingAdjustment": 2,
  "Cooldown": 300,
  "MetricAggregationType": "Average",
  "TargetTrackingConfiguration": {
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ASGAverageCPUUtilization"
    },
    "TargetValue": 70.0
  }
}
```

---

## Monitoring & Observability

### Prometheus Metrics

```typescript
// Expose metrics endpoint
app.get('/metrics', (req, res) => {
    const metrics = agent.getPerformanceMetrics();
    res.send(`
# HELP telemed_requests_total Total number of requests
# TYPE telemed_requests_total counter
telemed_requests_total ${metrics.requestCount}

# HELP telemed_response_time_seconds Response time in seconds
# TYPE telemed_response_time_seconds histogram
telemed_response_time_seconds_bucket{le="0.5"} ${metrics.p50ResponseTime / 1000}
telemed_response_time_seconds_bucket{le="0.95"} ${metrics.p95ResponseTime / 1000}
telemed_response_time_seconds_bucket{le="0.99"} ${metrics.p99ResponseTime / 1000}

# HELP telemed_error_rate Error rate percentage
# TYPE telemed_error_rate gauge
telemed_error_rate ${metrics.errorRate}
    `);
});
```

### Grafana Dashboard

Key metrics to monitor:
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate
- Cache hit rate
- CPU/Memory usage
- Queue size
- Active connections

---

## Capacity Planning

### Sizing Guide

| Users | Instances | CPU/Instance | Memory/Instance | Cache Size |
|-------|-----------|--------------|-----------------|------------|
| 1K    | 1         | 1 core       | 512 MB          | 100 MB     |
| 5K    | 3         | 1 core       | 512 MB          | 200 MB     |
| 10K   | 5         | 2 cores      | 1 GB            | 500 MB     |
| 50K   | 10        | 2 cores      | 2 GB            | 1 GB       |
| 100K  | 20        | 4 cores      | 4 GB            | 2 GB       |

### Cost Optimization

1. **Use Caching**: Reduce API calls by 70%
2. **Right-Size Instances**: Monitor and adjust
3. **Auto-Scaling**: Scale down during off-peak
4. **Reserved Instances**: For baseline capacity
5. **Spot Instances**: For burst capacity

---

## High Availability

### Multi-Region Deployment

```
Region 1 (US-East)          Region 2 (US-West)
┌─────────────────┐         ┌─────────────────┐
│  Load Balancer  │         │  Load Balancer  │
└────────┬────────┘         └────────┬────────┘
         │                           │
    ┌────┴────┐                 ┌────┴────┐
    ▼         ▼                 ▼         ▼
 Agent-1   Agent-2           Agent-3   Agent-4
    │         │                 │         │
    └────┬────┘                 └────┬────┘
         ▼                           ▼
    Redis Primary              Redis Replica
         │                           │
         └───────────┬───────────────┘
                     ▼
              Global Traffic Manager
```

### Disaster Recovery

1. **Backup Strategy**: Daily backups of cache and logs
2. **Failover**: Automatic failover to secondary region
3. **RTO**: <5 minutes
4. **RPO**: <1 hour

---

## Best Practices

1. ✅ **Start Small**: Begin with 2-3 instances
2. ✅ **Monitor Metrics**: Set up comprehensive monitoring
3. ✅ **Auto-Scale**: Configure auto-scaling policies
4. ✅ **Use Health Checks**: Implement liveness/readiness probes
5. ✅ **Cache Aggressively**: Enable caching for common queries
6. ✅ **Load Test**: Test before production deployment
7. ✅ **Plan for Failures**: Implement circuit breakers
8. ✅ **Multi-Region**: For critical applications

---

## Load Testing

### Using Artillery

```yaml
config:
  target: 'https://telemed.example.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: Warm up
    - duration: 300
      arrivalRate: 50
      name: Sustained load
    - duration: 60
      arrivalRate: 100
      name: Spike test

scenarios:
  - name: Chat flow
    flow:
      - post:
          url: '/chat'
          json:
            sessionId: '{{ $randomString() }}'
            message: 'I have a headache'
```

Run: `artillery run load-test.yml`

---

## Support

For scaling assistance:
- Review performance metrics
- Consult [PERFORMANCE.md](./PERFORMANCE.md)
- Contact support for enterprise deployments
