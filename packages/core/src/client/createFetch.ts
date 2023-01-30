import type { Handler } from '../types'

/**
 * typed response from fetch request
 */
export interface TypedResponse<Output> extends Response {
  json(): Promise<Output>
}

/**
 * options for create fetch
 */
export interface FetchOpts {
  baseUrl?: string
}

/**
 * wrapper around fetch
 */
export function createFetch(handler: Handler, path='', opts?: FetchOpts) {
  let url = `${opts?.baseUrl || ''}${path}`

  if (handler._input || handler._schema) {
    return (input: any, init?: RequestInit) => 
      fetchWrapper(url, input, { method: handler._method, ...init }) as Promise<TypedResponse<Handler['_output']>>
  }
  return (init?: RequestInit) => 
    fetchWrapper(url, undefined, { method: handler._method, ...init }) as Promise<TypedResponse<Handler['_output']>>
}

function fetchWrapper(path='', input: any, init?: RequestInit) {
  /**
   * if GET request, then encode the input as a query string
   */
  if (init?.method === 'GET') {
    const query = input ? `?${new URLSearchParams(input).toString()}` : ''
    return fetch(`${path}${query}`, init)
  }

  /**
   * if multipart/form-data, send with FormData API
   */
  else if (init?.headers && 'Content-Type' in init?.headers && init?.headers['Content-Type'] === 'multipart/form-data') {
    const formData = new FormData()
    for (const key in input) {
      formData.append(key, input[key])
    }

    /**
     * let the browser define the content type with "boundary"
     * @see {@link https://muffinman.io/blog/uploading-files-using-fetch-multipart-form-data/}
     */
    delete init.headers['Content-Type']
    return fetch(path, { body: formData, ...init })
  }

  /** 
   * default: encode the input as JSON and make the request
   */
  return fetch(path, { body: JSON.stringify(input), ...init })
}
