# <div align='center'> <a> **Bun Crumb** </a> </div>

<div align='center'>

[![CI](https://github.com/a-marigold/crumb/actions/workflows/ci.yaml/badge.svg)](https://github.com/a-marigold/bun-crumb/actions) [![Status](https://img.shields.io/badge/BETA-darkgreen?style=for-the-badge)](https://npmjs.com/package/bun-crumb)
[![bun](https://img.shields.io/badge/Bun-000?logo=bun&logoColor=fff)](https://bun.com) [![npm](https://img.shields.io/npm/v/bun-crumb)](https://npmjs.com/package/bun-crumb)

</div>

### Features

- Only Bun is supported

- No classes

- Uses `Bun.serve` routes

### Installation

```bash
bun add bun-crumb
```

### Usage

Handling Requests

```typescript
import { createRoute, listen, type RouteResponse } from 'bun-crumb';

const PORT = process.env.PORT ?? 3200;

type Product = { title: string; price: number; id: number };
const products: Product[] = [];

createRoute({
    url: '/products',

    method: 'GET',

    handler: (request, response: RouteResponse<{ body: Product[] }>) => {
        return response.send(
            [
                { title: 'bananas', price: 0.57, id: 1 },

                { title: 'bread', price: 0.89, id: 2 },

                { title: 'milk', price: 0.83, id: 3 },
            ],

            { status: 200 },
        );
    },
});

listen({ port: PORT }); // This should be after all `createRoute` calls.
```

### Benchmarks

- Machine:
    - windows 11
    - intel core i5 10300H
    - 16gb ram

- Load testing tool: grafana/k6

- Bun version: 1.3.6

<details> 
    <summary>k6 script</summary>

```bash
sleep 1 | k6 run script.js
```

```javascript
import { PORT } from './constants.js';

import http from 'k6/http';

export const options = {
    scenarios: {
        load: {
            executor: 'constant-arrival-rate',

            rate: 16000,
            timeUnit: '1s',

            duration: '30s',
            preAllocatedVUs: 1000,

            maxVUs: 3000,
        },
    },
};

export default () => {
    http.post(
        'http://localhost:' + PORT + '/',
        JSON.stringify({ key: 'value' }),
        { headers: { 'Content-Type': 'application/json' } },
    );
};
```

</details>

<details>
    <summary>Pure Bun server code</summary>

```typescript
import { serve, stdout } from 'bun';

import { PORT } from './constants';

serve({
    routes: {
        '/': {
            POST: (request) => {
                return request.json().then(
                    (body) =>
                        new Response(JSON.stringify(body), {
                            headers: { 'Content-Type': 'application/json' },
                        }),
                );
            },
        },
    },
    port: PORT,
});
stdout.write('Bun is running\n');
```

</details>

<details>
    <summary>Fastify server code</summary>

```typescript
import Fastify from 'fastify';

import { PORT } from './constants';

const fastify = Fastify({ logger: false });

fastify.route({
    url: '/',
    method: 'POST',
    handler: (request, response) => {
        return response.send(request.body);
    },
});

fastify.listen({ port: PORT }, () => {
    Bun.stdout.write('Fastify is running\n');
});
```

</details>

<details>
    <summary>Bun Crumb server code</summary>

```typescript
import { PORT } from './constants';

import { listen, createRoute } from 'bun-crumb';

//
createRoute({
    url: '/',

    method: 'POST',

    handler: (request, response) => {
        return request.handleBody().then(response.send);
    },
});

listen({ port: PORT });
```

</details>

| Library   | Total requests | RPS            | Requests failed | Avg. request duration |
| --------- | -------------- | -------------- | --------------- | --------------------- |
| Pure Bun  | 482681         | 15958.069946/s | 0.00% (0)       | 12.48ms               |
| Bun Crumb | 474870         | 15789.504029/s | 0.02% (101)     | 23.08ms               |
| Fastify   | 364525         | 12060.63486/s  | 0.27% (1002)    | 237.68ms              |
