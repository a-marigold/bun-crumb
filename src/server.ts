import { serve, stdout } from 'bun';

import type { BunRequest } from 'bun';

import { HttpError } from './errors/HttpError';

import type {
    Route,
    RouteOptions,
    ListenOptions,
    RouteRequest,
    Validate,
    HttpMethod,
} from './types';

import { handleBody, handleRequest } from './runtime';

type PreparedRoute = Partial<Record<HttpMethod, WrappedRouteCallback>>;

type WrappedRouteCallback = (request: BunRequest) => Promise<Response>;

/**
 * Used straight as Bun.serve `routes` object.
 */
type PreparedRoutes = Record<RouteOptions['url'], PreparedRoute>;

export type Routes = Map<RouteOptions['url'], Route>;

/**
 * *Internal server object.*
 *
 * `Map` with routes of app. Do not use it in user code to prevent undefined errors
 */

export const _routes: Routes = new Map();

/**
 * *Internal server function.*
 *
 * Creates a function with handler and all route hooks.
 *
 * The created function can be used as a callback for route in Bun.serve `routes` object.
 *
 *
 *
 *
 *
 * @param routeOptions options of route
 *
 * @returns {WrappedRouteCallback} Function that is ready to be used in Bun.serve `routes`
 */
export const wrapRouteCallback = (
    routeOptions: RouteOptions,
    schemaValidator?: Validate,
): WrappedRouteCallback => {
    return (request) => {
        const contentType = request.headers.get('Content-Type') ?? 'text/plain';

        const routeRequest: Partial<RouteRequest> = request;

        routeRequest.handleBody = () => {
            return handleBody(
                request,
                contentType,
                routeOptions.schema,
                schemaValidator,
            );
        };

        routeRequest.query = new URLSearchParams(
            request.url.split('?')[1] || '',
        );

        return Promise.resolve(
            handleRequest(
                // assertion is not dangerous because `handleBody` function is identified above

                routeRequest as RouteRequest,

                routeOptions,
            ),
        )
            .then((response) => response)
            .catch((error) => {
                if (error instanceof HttpError) {
                    return new Response(error.message, {
                        status: error.status,
                    });
                }
                // error fallback
                return new Response('Internal server error', { status: 500 });
            });
    };
};

/**
 * *Internal server function.*
 *
 * Prepares a route to be used in Bun.serve `routes` object.
 *
 * @param {Route} route
 *
 * @returns {PreparedRoute} Route object with `GET` or other http method keys with wrapped route callbacks.
 *
 * @example
 *
 * ```typescript
 * prepareRoute({
 *   GET: {
 *     url: '/products',
 *       method: 'GET',
 *       handler: (request, response) => {},
 *   },
 *   POST: {
 *     url: '/products/:id',
 *       method: 'POST',
 *       handler: (request, response) => {},
 *   },
 * });
 * // Output will be:
 * ({
 *   GET: (request: BunRequest) => {
 *     // ...code
 *     return new Response();
 *   },
 *   POST: (request: BunRequest) => {
 *     // ...code
 *     return new Response();
 *   },
 * })
 * ```
 *
 */
export const prepareRoute = (
    route: Route,

    schemaValidator?: Validate,
): PreparedRoute => {
    const preparedRoute: PreparedRoute = {};

    for (const method in route) {
        if (Object.hasOwn(route, method)) {
            // assertions below are not dangerous because method is own property and it is already in the route
            preparedRoute[method as HttpMethod] = wrapRouteCallback(
                route[method as HttpMethod] as RouteOptions,

                schemaValidator,
            );
        }
    }

    return preparedRoute;
};

/**
 * *Internal server function.*
 *
 *
 * Calls `prepareRoute` function for every route of `_routes` Map and returns prepared routes to use in `Bun.serve` `routes`.
 *
 * @param {Routes} routes Map with routes to prepare.
 *
 * @returns {PreparedRoutes} An object that is used straight in Bun.serve `routes` object.
 */
export const prepareRoutes = (
    routes: Routes,
    schemaValidator?: Validate,
): PreparedRoutes => {
    const preparedRoutes: PreparedRoutes = {};
    for (const route of routes) {
        preparedRoutes[route[0]] = prepareRoute(route[1], schemaValidator);
    }
    routes.clear();

    return preparedRoutes;
};

/**
 *
 * Starts to serve http server.
 *
 *
 * @param {ListenOption} options - options
 *
 *
 *
 *
 * @example
 *
 * ```typescript
 * import { listen } from 'crumb-bun';
 *
 * const PORT = proccess.env['PORT'] || 1000;
 *
 * listen(PORT, 'localhost');
 * ```
 */
export const listen = (options?: ListenOptions): void => {
    const server = serve({
        port: options?.port,
        hostname: options?.hostname,
        development: options?.development ?? false,

        routes: prepareRoutes(_routes, options?.schemaValidator),
    });

    stdout.write('Server is running on ' + server.url.href + '\n');
};
