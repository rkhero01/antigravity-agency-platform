/**
 * Telemetry Event Repository
 * Task 28 — Step 1: Backend Execution Observability
 */

import { BaseRepository } from './baseRepository.js';
import { redactSecrets } from '../utils/redaction.js';

export class TelemetryRepository extends BaseRepository {
  constructor() {
    super('TelemetryEvent');
  }

  async recordTelemetry(data) {
    const cleanData = {
      ...data,
      metadataJson: JSON.stringify(redactSecrets(data.metadata || {})),
    };
    delete cleanData.metadata;
    return this.create(cleanData);
  }
}

export const telemetryRepository = new TelemetryRepository();
export default telemetryRepository;
