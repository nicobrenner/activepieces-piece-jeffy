import { createAction, Property } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import { jeffyAuth, getBaseUrl, getHeaders, JeffyAuthValue } from '../auth';

export const batchClassify = createAction({
  name: 'batch_classify',
  auth: jeffyAuth,
  displayName: 'Batch Classify',
  description:
    'Classify multiple texts in one request using a pretrained Jeffy task',
  props: {
    task: Property.Dropdown({
      auth: jeffyAuth,
      displayName: 'Task',
      description: 'The classification task to use',
      required: true,
      refreshers: [],
      options: async ({ auth }) => {
        if (!auth) {
          return {
            disabled: true,
            options: [],
            placeholder: 'Connect your Jeffy server first',
          };
        }
        const typedAuth = auth as unknown as JeffyAuthValue;
        const baseUrl = getBaseUrl(typedAuth);
        const headers = getHeaders(typedAuth);
        try {
          const response = await httpClient.sendRequest({
            method: HttpMethod.GET,
            url: `${baseUrl}/v1/capabilities`,
            headers,
          });
          const capabilities = (
            response.body as {
              capabilities: Array<{
                task_id: string;
                name: string;
                n_classes: number;
              }>;
            }
          ).capabilities;
          return {
            disabled: false,
            options: capabilities.map((cap) => ({
              label: `${cap.name} (${cap.n_classes} classes)`,
              value: cap.task_id,
            })),
          };
        } catch {
          return {
            disabled: true,
            options: [],
            placeholder: 'Could not load tasks from server',
          };
        }
      },
    }),
    texts: Property.LongText({
      displayName: 'Texts',
      description:
        'Multiple texts to classify — one per line, or a JSON array of strings',
      required: true,
    }),
  },
  async run(context) {
    const auth = context.auth as unknown as JeffyAuthValue;
    const baseUrl = getBaseUrl(auth);
    const headers = getHeaders(auth);

    const textsRaw = context.propsValue.texts;
    let texts: string[];
    try {
      texts = JSON.parse(textsRaw);
    } catch {
      texts = textsRaw
        .split('\n')
        .map((t: string) => t.trim())
        .filter(Boolean);
    }

    const response = await httpClient.sendRequest({
      method: HttpMethod.POST,
      url: `${baseUrl}/v1/predict/batch`,
      headers,
      body: { task: context.propsValue.task, texts },
    });

    return response.body;
  },
});
