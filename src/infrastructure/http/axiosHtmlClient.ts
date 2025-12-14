import axios, { type AxiosResponse } from "axios";

/**
 * ======================
 * HTTP Client Abstraction
 * ======================
 */

/**
 * Minimal HTTP client interface for retrieving raw HTML.
 *
 * This abstraction allows the infrastructure layer to:
 * - swap HTTP implementations (Axios, fetch, Bun, mocks)
 * - isolate networking concerns from gateways and parsers
 * - simplify testing
 */
export interface HttpClient {
  /**
   * Executes an HTTP GET request and returns the response body as text.
   *
   * @param url - Fully qualified URL to request
   * @param headers - Optional HTTP headers (e.g. User-Agent)
   * @returns Raw response body as a string
   */
  get(url: string, headers?: Record<string, string>): Promise<string>;
}

/**
 * Axios-based implementation of {@link HttpClient}.
 *
 * This client is optimized for HTML retrieval:
 * - forces `responseType: "text"`
 * - returns only the response body
 */
export class AxiosHtmlClient implements HttpClient {
  /**
   * Executes an HTTP GET request using Axios and returns raw HTML.
   *
   * @param url - Fully qualified URL to request
   * @param headers - Optional HTTP headers
   * @returns Raw HTML response body
   *
   * @throws AxiosError if the request fails
   */
  async get(
    url: string,
    headers?: Record<string, string>,
  ): Promise<string> {
    const config = {
      responseType: "text" as const,
      ...(headers && { headers }),
    };

    const response: AxiosResponse<string> =
      await axios.get<string>(url, config);

    return response.data;
  }
}
