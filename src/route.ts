// TODO: add docs

import { _routes } from './server';

import type { RouteOptions } from './types';

export const createRoute = (route: RouteOptions) => {
    _routes.set(route.url, { [route.method]: route });
};
