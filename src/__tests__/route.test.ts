import { describe, it, expect, beforeAll } from 'bun:test';

import { _routes } from '../server';

import { createRoute } from '../route';

beforeAll(() => {
    _routes.clear();
});

describe('createRoute', () => {
    it('should mutate `_routes` Map on `createRoute` call', () => {
        createRoute({ url: '/test', method: 'GET', handler: () => {} });

        expect(_routes.size).toBe(1);
        expect(_routes.get('/test')).toHaveProperty('GET');
    });

    it('should append new method in `_routes` when called with the same url twice', () => {
        createRoute({ url: '/test', method: 'GET', handler: () => {} });
        createRoute({ url: '/test', method: 'POST', handler: () => {} });

        expect(_routes.size).toBe(1);
        expect(_routes.get('/test')).toHaveProperty('GET');
        expect(_routes.get('/test')).toHaveProperty('POST');

        expect(_routes.get('/test')?.GET).toBeTypeOf('object');
        expect(_routes.get('/test')?.POST).toBeTypeOf('object');
    });

    it('should redefine method of route when the same url and method called twice', () => {
        createRoute({
            url: '/test',
            method: 'GET',

            handler: () => {},
        });

        expect(_routes.get('/test')?.GET).toHaveProperty('handler');

        expect(_routes.get('/test')?.GET).not.toHaveProperty('schema');

        createRoute({
            url: '/test',

            method: 'GET',

            schema: 'SCHEMA' as unknown as undefined,

            handler: () => {},
        });

        expect(_routes.get('/test')?.GET).toHaveProperty('schema');
    });
});
