/**
 * uninitialized request handler
 */
export interface UninitializedHandler extends Handler{
  _method: undefined
  _path: undefined
  _ctx: undefined
  _schema: undefined
  _input: undefined
  _output: undefined
  _preResolver: undefined
  _parser: undefined
  _resolver: undefined
  _postResolver: undefined
}

/**
 * generic request handler
 */
export interface Handler {
  /**
   * HTTP request method, defined and custom methods allowed
   */
  _method: any

  /**
   * request URL
   */
  _path: any

  /**
   * data shared between resolvers
   */
  _ctx: any

  /**
   * schema to parse input
   */
  _schema: any

  /**
   * input to resolver
   */
  _input: any

  /**
   * output of resolver
   */
  _output: any

  /**
   * 1) pre-resolver
   */
  _preResolver: any

  /**
   * 2) parse and validate input
   */
  _parser: any

  /**
   * 3) generate response
   */
  _resolver: any

  /**
   * 4) post-resolver
   */
  _postResolver: any
}
