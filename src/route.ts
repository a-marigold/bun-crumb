import { _routes } from './server';

import type { RouteOptions } from './types';

// TODO: fix this gaps
/**
 * Creates a route with `url`, `method` and `handler`.
 * Should be called before `listen` function is called.
 *
 *
 * @param {RouteOptions} routeOptions - route
 *
 *
 *
 * @example <caption> Route with anonymous handler  </caption>
 * ```typescript
 * createRoute({
 *  url: '*',
 *  method: 'GET',
 *  handler: (request, response) => {
 *     response.send(
 *       { message: 'The resource you are looking for is not found.' },
 *       { status: 404, statusText: 'Not Found' }
 *     );
 *  },
 * });
 * ```
 *
 * @example <caption> Route with handler as external function </caption>
 * ```typescript
 * const deleteProduct = (
 *  request: RouteRequest,
 *  response: RouteResponse<{ body: { error: string } | { product: Product } }>
 * ) => {
 *   const id = request.params.id;
 *
 *   if (!(id in products)) {
 *       return response.send(
 *
 *        { error: 'Product with this id is not found' },
 *        { status: 404 }
 *      );
 *  }
 *  const product = products[id];
 *
 *  products[id] = null;
 *
 *  return response.send(product);
 * };
 *
 * createRoute({
 *    url: '/products/:id',
 *    method: 'DELETE',
 *
 *    handler: deleteProduct,
 * });
 * ```
 */

export const createRoute = (routeOptions: RouteOptions): void => {
    const route = _routes.get(routeOptions.url);

    if (!route) {
        _routes.set(routeOptions.url, { [routeOptions.method]: routeOptions });

        return;
    }

    route[routeOptions.method] = routeOptions;
};
