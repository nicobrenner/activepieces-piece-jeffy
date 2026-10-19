import { createAction, Property } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import { jeffyAuth, getBaseUrl, getHeaders, JeffyAuthValue } from '../auth';

export const classify = createAction({
  name: 'classify',
  auth: jeffyAuth,
  displayName: 'Classify Text',
  description:
    'Classify a single text input using a pretrained Jeffy task — returns the predicted label and confidence in ~15ms',
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
    text: Property.LongText({
      displayName: 'Text',
      description: 'The text to classify',
      required: true,
    }),
    threshold: Property.Number({
      displayName: 'Confidence Threshold',
      description:
        'Minimum confidence (0–1). Below this, the result is marked out_of_scope instead of forcing a label',
      required: false,
      defaultValue: 0,
    }),
  },
  async run(context) {
    const auth = context.auth as unknown as JeffyAuthValue;
    const baseUrl = getBaseUrl(auth);
    const headers = getHeaders(auth);

    const body: Record<string, unknown> = {
      task: context.propsValue.task,
      text: context.propsValue.text,
    };
    if (context.propsValue.threshold && context.propsValue.threshold > 0) {
      body.threshold = context.propsValue.threshold;
    }

    const response = await httpClient.sendRequest({
      method: HttpMethod.POST,
      url: `${baseUrl}/v1/predict`,
      headers,
      body,
    });

    return response.body;
  },
});
