/**
 * The global Schema type that will be used in every
 *
 * @default {}
 *
 * @example
 *
 * ```typescript
 * import type { ZodType } from 'zod';
 *
 * declare module 'crumb-bun' {
 *    interface Schema {
 *        zod: ZodType
 *    }
 * }
 * ```
 */
export interface Schema {}

/**
 * The global schema validator type.
 * Supports any schemas like `zod`, `ajv`, `yup`
 */
export interface Validator {
    validate: (data: unknown, schema: Schema) => void;
}
