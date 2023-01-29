/**
 * typed response from fetch request
 */
interface TypedResponse<Output> extends Response {
  json(): Promise<Output>
}

/**
 * wrapper around fetch
 */
export const _fetch = <Output>(path: string, input: any, init: RequestInit): Promise<TypedResponse<Output>> => {
  /**
   * if GET request, then encode the input as a query string
   */
  if (init.method === 'GET') {
    const query = input ? new URLSearchParams(input) : ''
    return fetch(`${path}/${query.toString()}`, init)
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
