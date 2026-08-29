/**
 * Base Provider Interface Definition
 * Task 27 — Step 6: Provider Abstraction
 */

export class BaseProvider {
  constructor(name, mode = 'DEMO') {
    this.name = name;
    this.mode = mode;
  }

  async executeAction(action, payload = {}) {
    throw new Error(`executeAction() must be implemented by ${this.constructor.name}`);
  }

  async rollbackAction(action) {
    throw new Error(`rollbackAction() must be implemented by ${this.constructor.name}`);
  }

  async getHealthStatus() {
    throw new Error(`getHealthStatus() must be implemented by ${this.constructor.name}`);
  }
}

export default BaseProvider;
