import { createAction } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import { jeffyAuth, getBaseUrl, getHeaders, JeffyAuthValue } from '../auth';

export const listCapabilities = createAction({
  name: 'list_capabilities',
  auth: jeffyAuth,
  displayName: 'List Classifiers',
  description:
    'List all available classification tasks on the Jeffy server',
  props: {},
  async run(context) {
    const auth = context.auth as unknown as JeffyAuthValue;
    const baseUrl = getBaseUrl(auth);
    const headers = getHeaders(auth);

    const response = await httpClient.sendRequest({
      method: HttpMethod.GET,
      url: `${baseUrl}/v1/capabilities`,
      headers,
    });

    return response.body;
  },
});
