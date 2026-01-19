// TODO: add docs

import type { BunRequest, CookieInit } from 'bun';
import type { SchemaData } from './schema';

import type { Header, HttpMethod, RedirectStatusCode } from './utils';

/**
 *
 * Type of Request search parameters
 */
export type RouteRequestParams<T extends string | undefined = undefined> = [
    T,
] extends [string]
    ? {
          [K in T]: string;
      }
    : { [key: string]: string | undefined };

/**
 * Type of RouteRequest generic
 */
export interface RouteRequestGeneric {
    body?: unknown;

    params?: string;
}

/**
 *
 *
 * Type of route handler `request` parameter
 */
export interface RouteRequest<
    T extends RouteRequestGeneric = RouteRequestGeneric,
> extends Omit<BunRequest, 'params'> {
    query: URLSearchParams;
    params: RouteRequestParams<T['params']>;

    /**
     * #### Parses and validates body of request.
     *
     * - Parses body to JSON or text
     * - Validates body with `schemaValidator` if it is provided.
     *
     * @returns Promise with handled body
     *
     * @example
     *
     * ```typescript
     * request.handleBody().then((bodyData) => {
     *   console.log(bodyData);
     * })
     * ```
     */
    handleBody: () => Promise<
        T extends { body: unknown } ? T['body'] : unknown
    >;
}

export interface ResponseOptions {
    status: number;
    statusText?: string;
}

/**
 *
 * Type of route handler `response`
 */
export interface RouteResponse<
    T extends { body: unknown } = { body: unknown },
> {
    /**
     * Sets Response body to provided `data`.
     * Automatically sets `Content-Type` to `application/json` if an object was provided and transforms `data` to JSON.
     *
     * ### **IMPORTANT NOTES**:
     *  - #### If `Content-Type` header is already set, this function will not change this header.
     *
     *
     *
     *
     *  - #### If you want to complete request and send response, you must necessarily `return` the call of this function. Otherwise, code of your handler will continue executing and `Response` body could be changed.
     *
     * @param data value that will be sent to client
     * @param options standard `Response` options from web API
     *
     * @example
     * ```typescript
     * response.setHeader('content-type', 'x-www-form-urlencoded'); // Set `Content-Type` header
     *
     * return response.send('Hello'); // This does not change `Content-Type` header, because this header is set above
     * ```
     *
     * @example
     * ```typescript
     * return response.send('Hello'); // This sets `Content-Type` header to `text/plain`, because this header is not set above.
     * ```
     *
     * @example
     * ```typescript
     * return response.send({ key: 'value' }); // This will set `Content-Type` header to `application/json`, because this header is not set above. Object is transformed to JSON automatically
     * ```
     *
     * @example
     * ```typescript
     * response.send({key: 'value'}); // ❌ Without return, the code below changes the body of response
     * response.send('Hello'); // ❌ This changes the body of response, but `Content-Type` header is the same
     * ```
     *
     */

    send: (data?: T['body'], options?: ResponseOptions) => void;

    /**
     * Sets `Location` header to provided `url` and `response.status` to provided `status`
     *
     *
     *
     * @param url `Location` to redirect
     *
     * @param status redirect http code (`3xx`). Equals to 302 by default
     *
     * @example
     *
     *
     * ```typescript
     * return response.redirect('https://bun-crumb.vercel.app', 302);
     * ```
     * The same behaviour is
     * ```typescript
     * response.setHeader('Location', 'https://bun-crumb.vercel.app');
     * return response.send('', { status: 302 });
     * ```
     */
    redirect: (
        url: string,
        status?: RedirectStatusCode | (number & {}),
    ) => void;

    /**
     * Sets the response header.
     *
     *
     *
     *
     * Overrides header if it already exists.
     *
     * Case of `name` is not important. Names 'content-type', 'Content-Type', 'CoNteNt=TYPE' are the same.
     *
     *
     * @param name header name
     * @param value header value
     *
     *
     * @example
     * ```typescript
     * response.setHeader('Access-Control-Allow-Origin', '*');
     * // The code below will override the header above
     * response.setHeader('access-control-allow-origin', 'https://bun-crumb.vercel.app');
     * ```
     */
    setHeader: (name: Header['name'], value: Header['value']) => void;

    /**
     *
     * @param options `Bun.Cookie` options parameter
     *
     *
     *
     *
     */
    setCookie: (options: CookieInit) => void;
}

export type Route = Partial<Record<HttpMethod, RouteOptions>>;

export type RouteHandler = (
    request: RouteRequest,

    response: RouteResponse,
) => Promise<void> | void;

export type RouteOptions = {
    url: string;
    method: HttpMethod;

    schema?: SchemaData;

    handler: RouteHandler;
};
