import { describe, it, expect } from 'bun:test';

import type { BunRequest } from 'bun';

import { HttpError } from '../errors/HttpError';
import type { Validate } from '../types';

import { handleBody } from '../runtime';

describe('handleBody', () => {
    it('should return a correct parsed json', () => {
        const testData = { key: 'value' };

        const testRequest = {
            json: () => {
                return Promise.resolve(testData);
            },
        } as BunRequest;

        handleBody(testRequest, 'application/json').then((bodyData) => {
            expect(bodyData).toEqual(testData);
        });
    });

    it('should return a correct parsed text/plain', () => {
        const testData = 'Test string';

        const testRequest = {
            text: () => {
                return Promise.resolve(testData);
            },
        } as BunRequest;

        handleBody(testRequest, 'text/plain').then((bodyData) => {
            expect(bodyData).toBe(testData);
        });
    });

    it('should throw an error if contentType is not supported', () => {
        const testRequest = {
            json: () => {
                return Promise.resolve({ key: 'value' });
            },
        } as BunRequest;

        handleBody(testRequest, 'image/png').catch((error) => {
            expect(error).toBeInstanceOf(HttpError);
            expect(error).toHaveProperty('status', 415);
        });
    });

    it('should handle text/plain with schema correctly', () => {
        const testData = 'Test Data';

        const testRequest = {
            text: () => {
                return Promise.resolve(testData);
            },
        } as BunRequest;

        const testSchema = 'Test Data';

        const schemaValidator: Validate = (data, schema) => {
            return data === schema;
        };

        handleBody(
            testRequest,
            'text/plain',
            testSchema as unknown as undefined,
            schemaValidator,
        );
    });

    it('should throw an error if text/plain does not match schema', () => {
        const testTextData = 'Text Data';
        const testTextRequest = {
            text: () => {
                return Promise.resolve(testTextData);
            },
        } as BunRequest;
        const schema = 'Valid Text Data';

        const schemaValidator: Validate = (data, schema) => {
            return data === schema;
        };

        handleBody(
            testTextRequest,
            'text/plain',
            schema as unknown as undefined,
            schemaValidator,
        ).catch((error) => {
            expect(error).toBeInstanceOf(HttpError);

            expect(error).toHaveProperty('status', 400);
        });
    });

    it('should throw an error if json does not match schema', () => {
        const testJsonData = { name: 'Json' };
        const testJsonRequest = {
            json: () => {
                return Promise.resolve(testJsonData);
            },
        } as BunRequest;

        const schema = { quantity: 16, width: 10 };

        const schemaValidator: Validate = (data, schema) => {
            return JSON.stringify(data) === JSON.stringify(schema);
        };

        handleBody(
            testJsonRequest,
            'application/json',

            schema as unknown as undefined,
            schemaValidator,
        ).catch((error) => {
            expect(error).toBeInstanceOf(HttpError);
            expect(error).toHaveProperty('status', 400);
        });
    });
});
