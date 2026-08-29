/**
 * Production-Grade Base Repository Interface & In-Memory Storage Adapter
 * Task 28 — Step 5: Repository Persistence Adapter & Transaction Atomicity
 */

export class BaseRepository {
  constructor(entityName) {
    this.entityName = entityName;
    this.inMemoryStore = new Map();
  }

  async findById(id, agencyId = null) {
    const item = this.inMemoryStore.get(id);
    if (!item) return null;
    if (item.deletedAt) return null;
    if (agencyId && item.agencyId && item.agencyId !== agencyId) {
      return null; // Strict tenant boundary
    }
    return JSON.parse(JSON.stringify(item));
  }

  async findMany(filters = {}, agencyId = null) {
    let items = Array.from(this.inMemoryStore.values());

    // Exclude soft-deleted records
    items = items.filter((item) => !item.deletedAt);

    // Multi-tenant scope
    if (agencyId) {
      items = items.filter((item) => item.agencyId === agencyId);
    }

    // Apply exact match filters
    for (const [k, v] of Object.entries(filters)) {
      if (v !== undefined && v !== 'all' && v !== null) {
        items = items.filter((item) => item[k] === v);
      }
    }

    return JSON.parse(JSON.stringify(items));
  }

  async create(data) {
    const id = data.id || `${this.entityName.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const record = {
      ...data,
      id,
      createdAt: data.createdAt ? new Date(data.createdAt) : now,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : now,
      deletedAt: null,
    };
    this.inMemoryStore.set(id, record);
    return JSON.parse(JSON.stringify(record));
  }

  async update(id, updates, agencyId = null) {
    const existing = await this.findById(id, agencyId);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
      id: existing.id,
      agencyId: existing.agencyId, // Immutable tenant boundary
      updatedAt: new Date(),
    };
    this.inMemoryStore.set(id, updated);
    return JSON.parse(JSON.stringify(updated));
  }

  async delete(id, agencyId = null, softDelete = true) {
    const existing = await this.findById(id, agencyId);
    if (!existing) return false;

    if (softDelete) {
      existing.deletedAt = new Date();
      existing.updatedAt = new Date();
      this.inMemoryStore.set(id, existing);
    } else {
      this.inMemoryStore.delete(id);
    }
    return true;
  }

  /**
   * Transactional Execution Wrapper (Phase 6)
   * Provides atomic snapshot and rollback semantics in In-Memory mode
   */
  async withTransaction(operationCallback) {
    const snapshot = new Map(this.inMemoryStore);
    try {
      const result = await operationCallback(this);
      return result;
    } catch (err) {
      // Rollback to prior snapshot on failure
      this.inMemoryStore = snapshot;
      throw err;
    }
  }
}

export default BaseRepository;
