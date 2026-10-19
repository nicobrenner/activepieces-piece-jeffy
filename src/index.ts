import { createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { jeffyAuth } from './lib/auth';
import { classify } from './lib/actions/classify';
import { batchClassify } from './lib/actions/batch-classify';
import { listCapabilities } from './lib/actions/list-capabilities';
import { healthCheck } from './lib/actions/health-check';

export const jeffy = createPiece({
  displayName: 'Jeffy',
  description:
    'Fast text classification — 70 pretrained tasks, 15ms inference, CPU only, no LLM needed',
  logoUrl: 'https://cdn.activepieces.com/pieces/jeffy.png',
  auth: jeffyAuth,
  minimumSupportedRelease: '0.36.1',
  categories: [PieceCategory.ARTIFICIAL_INTELLIGENCE],
  authors: ['nicobrenner'],
  actions: [classify, batchClassify, listCapabilities, healthCheck],
  triggers: [],
});
