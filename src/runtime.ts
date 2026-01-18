import { Cookie } from 'bun';
import type { BunRequest, BodyInit } from 'bun';

import { HttpError } from './errors/HttpError';

import type {
    RouteRequest,
    RouteResponse,
    RouteOptions,
    SchemaData,
    Validate,
} from './types';

/**
 *
 * *Internal server function.*
 *
 * Parses body to supported content type (json, plain text) and validates it with route schema.
 *
 * @param {BunRequest} request incoming bun request.
 * @param {string} contentType request `Content-Type` header value.
 * @param {Schema} schema json or any schema with declared `Schema` type.
 * @param {Validate} schemaValidator schema validator function that receives `data` and `schema` arguments.
 *
 * @returns {Promise<unknown>} Promise with body
 *
 *
 */
export const handleBody = (
    request: BunRequest,
    contentType: string,

    schema?: SchemaData,
    schemaValidator?: Validate,
): Promise<unknown> => {
    const contentHandlers = {
        'application/json': (request: BunRequest) => {
            return request
                .json()
                .catch(() => {
                    throw new HttpError(400, 'Bad Request');
                })
                .then((data) => {
                    if (
                        schema &&
                        schemaValidator &&
                        !schemaValidator(data, schema)
                    ) {
                        throw new HttpError(
                            400,
                            'Request does not match schema',
                        );
                    }
                    return data;
                });
        },

        'text/plain': (request: BunRequest) => {
            return request
                .text()

                .catch((error) => {
                    throw new HttpError(400, error);
                })
                .then((data) => {
                    if (
                        schema &&
                        schemaValidator &&
                        !schemaValidator(data, schema)
                    ) {
                        throw new HttpError(
                            400,
                            'Request does not match schema',
                        );
                    }
                    return data;
                });
        },
    };

    return contentType in contentHandlers
        ? contentHandlers[contentType as keyof typeof contentHandlers](request)
        : Promise.reject(new HttpError(415, 'Unsupported media type'));
};

/**
 * *Internal server function.*
 *
 * #### Handles request and returns `Response` instance.
 *
 * @param {RouteRequest} routeRequest prepared `BunRequest` with added stuff from `bun-crumb`
 * @param {RouteOptions} routeOptions options of route
 *
 * @returns response on the incoming request as `Response` instance.
 */
export const handleRequest = (
    routeRequest: RouteRequest,
    routeOptions: RouteOptions,
): Promise<Response> => {
    let status: number = 200;
    let statusText: string | undefined = '';

    let responseBody: BodyInit = '';
    const responseHeaders: Headers = new Headers();

    const routeResponse: RouteResponse = {
        send: (data, options) => {
            if (typeof data === 'object') {
                if (!responseHeaders.has('Content-Type')) {
                    responseHeaders.set('Content-Type', 'application/json');
                }

                responseBody = JSON.stringify(data);
            } else if (typeof data === 'string') {
                if (!responseHeaders.has('Content-Type')) {
                    responseHeaders.set('Content-Type', 'text/plain');
                }

                responseBody = data;
            } else {
                responseBody = data as BodyInit;
            }

            if (options) {
                status = options.status;
                statusText = options.statusText;
            }
        },

        redirect: (url, redirectStatus) => {
            responseBody = '';

            status = redirectStatus || 302;
            responseHeaders.set('Location', url);
        },

        setHeader: (name, value) => {
            responseHeaders.set(name, value);
        },

        setCookie: (options) => {
            responseHeaders.append(
                'Set-Cookie',
                new Cookie(options).toString(),
            );
        },
    };

    return Promise.resolve(
        routeOptions.handler(routeRequest, routeResponse),
    ).then(
        () =>
            new Response(responseBody, {
                headers: responseHeaders,

                status,
                statusText,
            }),
    );
};
