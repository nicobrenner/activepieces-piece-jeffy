import { PieceAuth, Property } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import { AppConnectionType } from '@activepieces/shared';

export type JeffyAuthValue = {
  type: AppConnectionType.CUSTOM_AUTH;
  props: { base_url: string; api_key: string };
};

export const jeffyAuth = PieceAuth.CustomAuth({
  description: 'Connect to your Jeffy server for text classification',
  props: {
    base_url: Property.ShortText({
      displayName: 'Server URL',
      description:
        'The base URL of your Jeffy server (e.g. https://playground.jeffyclassify.com)',
      required: true,
      defaultValue: 'https://playground.jeffyclassify.com',
    }),
    api_key: PieceAuth.SecretText({
      displayName: 'API Key',
      description:
        'Optional API key if your Jeffy server requires authentication',
      required: false,
    }),
  },
  required: true,
  validate: async ({ auth }) => {
    try {
      const baseUrl = (auth.base_url as string).replace(/\/+$/, '');
      const response = await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: `${baseUrl}/health`,
      });
      const body = response.body as Record<string, unknown>;
      if (body.status === 'healthy') {
        return { valid: true };
      }
      return { valid: false, error: 'Server responded but is not healthy' };
    } catch {
      return { valid: false, error: 'Cannot reach Jeffy server at this URL' };
    }
  },
});

export function getBaseUrl(auth: JeffyAuthValue): string {
  return auth.props.base_url.replace(/\/+$/, '');
}

export function getHeaders(auth: JeffyAuthValue): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (auth.props.api_key) {
    headers['Authorization'] = `Bearer ${auth.props.api_key}`;
  }
  return headers;
}
