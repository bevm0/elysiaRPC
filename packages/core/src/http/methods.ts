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
 */
export type AnyHttpMethod = HttpMethod | string & {}
