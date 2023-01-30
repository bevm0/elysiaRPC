/**
 * HTTP methods 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods}
 */
export const HttpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT'] as const

/**
 * defined Http methods
 */
export type HttpMethod = (typeof HttpMethods)[number]

/**
 * allow custom HTTP methods
 * provides autocomplete for defined methods, but allows arbitrary strings 
 * @see {@link https://github.com/microsoft/TypeScript/issues/29729#issuecomment-1331857805}
 */
export type AnyHttpMethod = HttpMethod | string & {}
