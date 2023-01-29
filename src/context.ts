/**
 * context
 */
export type Context<TContext> = TContext | ((...args: any[]) => TContext)
