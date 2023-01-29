/**
 * context available to all server-side resolvers
 */
export type Context<TContext> = TContext | ((...args: any[]) => TContext)
