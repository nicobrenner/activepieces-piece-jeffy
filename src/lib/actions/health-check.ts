import { createAction } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import { jeffyAuth, getBaseUrl, getHeaders, JeffyAuthValue } from '../auth';

export const healthCheck = createAction({
  name: 'health_check',
  auth: jeffyAuth,
  displayName: 'Health Check',
  description: 'Check if the Jeffy server is running and ready',
  props: {},
  async run(context) {
    const auth = context.auth as unknown as JeffyAuthValue;
    const baseUrl = getBaseUrl(auth);
    const headers = getHeaders(auth);

    const response = await httpClient.sendRequest({
      method: HttpMethod.GET,
      url: `${baseUrl}/health`,
      headers,
    });

    return response.body;
  },
});
