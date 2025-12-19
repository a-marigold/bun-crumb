// TODO: add docs

import { serve } from 'bun';

import type {
    Route,
    RouteOptions,
    RouteRequest,
    RouteResponse,
    Headers,
    HttpMethod,
} from './types/route';

type WrappedRouteCallback = (request: Request) => Response;

type PreparedRoute = Partial<Record<HttpMethod, WrappedRouteCallback>>;

type PreparedRoutes = Record<RouteOptions['url'], PreparedRoute>;

export const _routes = new Map<RouteOptions['url'], Route>();

const wrapRouteCallback = (
    routeOptions: RouteOptions
): WrappedRouteCallback => {
    return () => Response.json();
};

const prepareRoute = (route: Route): PreparedRoute => {
    const preparedRoute: Partial<PreparedRoute> = {};

    for (const routeMethod of Object.entries(route) as [
        HttpMethod,

        RouteOptions
    ][]) {
        preparedRoute[routeMethod[0]] = wrapRouteCallback(routeMethod[1]);
    }

    return preparedRoute;
};

const prepareRoutes = (): PreparedRoutes => {
    const preparedRoutes: PreparedRoutes = {};

    _routes.forEach((options, url) => {
        preparedRoutes[url] = prepareRoute(options);
    });

    return preparedRoutes;
};

export const listen = (port?: number, hostname?: string): void => {
    serve({
        port,

        hostname,

        routes: prepareRoutes(),
    });
};
