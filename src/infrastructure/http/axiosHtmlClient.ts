import axios, {
    type AxiosResponse
} from "axios";

export interface HttpClient {
  get(url: string, headers?: Record<string, string>): Promise<string>;
}

export class AxiosHtmlClient implements HttpClient {
    async get(url: string, headers?: Record<string, string>): Promise<string> {
      const config = {
        responseType: "text" as const,
        ...(headers && { headers }),
      };
  
      const response: AxiosResponse = await axios.get<string>(url, config);
      return response.data;
    }
  }