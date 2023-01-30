import { getParseFn } from '../parser/createParserFn'
import type { Handler } from '../types'

/**
 * create a resolver
 */
export function createResolver(handler: Handler) {
  return async function resolver(args: any) {
    let output = args
    if (handler._preResolver) {
      output = await handler._preResolver(args)
    }
    if (handler._schema) {
      output.input = await getParseFn(handler._schema)(output.input)
    }
    if (handler._resolver) {
      output = await handler._resolver(output)
    }
    if (handler._postResolver) {
      output = await handler._postResolver(output)
    }
    else {
      output = JSON.stringify(output)
    }
    return output
  }
}
