/**
 * Agency Client Invoice & Billing Repository with Defensive Calculations
 * Task 28 — Step 3: Billing & Invoice Store
 */

import { BaseRepository } from './baseRepository.js';
import { safeNum } from '../utils/metrics.js';

export class InvoiceRepository extends BaseRepository {
  constructor() {
    super('Invoice');
    this.seedDefaultInvoices();
  }

  seedDefaultInvoices() {
    const demoAgencyId = 'agency-demo-001';
    const invoices = [
      {
        id: 'inv-101',
        agencyId: demoAgencyId,
        clientId: 'c1',
        contractId: 'cnt-101',
        invoiceNumber: 'INV-2026-001',
        issueDate: new Date('2026-02-01'),
        dueDate: new Date('2026-02-15'),
        subtotal: 25000,
        tax: 4500,
        discount: 0,
        total: 29500,
        amountPaid: 29500,
        balanceDue: 0,
        currency: 'INR',
        status: 'PAID',
        notes: 'Retainer fee for February 2026.',
      },
      {
        id: 'inv-102',
        agencyId: demoAgencyId,
        clientId: 'c1',
        contractId: 'cnt-101',
        invoiceNumber: 'INV-2026-002',
        issueDate: new Date('2026-03-01'),
        dueDate: new Date('2026-03-15'),
        subtotal: 25000,
        tax: 4500,
        discount: 1000,
        total: 28500,
        amountPaid: 0,
        balanceDue: 28500,
        currency: 'INR',
        status: 'ISSUED',
        notes: 'Retainer fee for March 2026 with loyalty discount.',
      },
      {
        id: 'inv-201',
        agencyId: demoAgencyId,
        clientId: 'c2',
        contractId: 'cnt-102',
        invoiceNumber: 'INV-2026-003',
        issueDate: new Date('2026-02-01'),
        dueDate: new Date('2026-02-10'),
        subtotal: 30000,
        tax: 5400,
        discount: 0,
        total: 35400,
        amountPaid: 15000,
        balanceDue: 20400,
        currency: 'INR',
        status: 'PARTIALLY_PAID',
        notes: 'First milestone payment received.',
      },
      {
        id: 'inv-isolated-99',
        agencyId: 'agency-demo-002',
        clientId: 'c-isolated-99',
        contractId: 'cnt-isolated-99',
        invoiceNumber: 'NXS-INV-99',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        subtotal: 75000,
        tax: 13500,
        discount: 0,
        total: 88500,
        amountPaid: 0,
        balanceDue: 88500,
        currency: 'INR',
        status: 'ISSUED',
      },
    ];

    for (const inv of invoices) {
      this.inMemoryStore.set(inv.id, {
        ...inv,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }
  }

  computeInvoiceTotals(subtotal, tax, discount, amountPaid) {
    const s = safeNum(subtotal);
    const t = safeNum(tax);
    const d = safeNum(discount);
    const p = safeNum(amountPaid);

    const total = Math.max(0, Number((s + t - d).toFixed(2)));
    const balanceDue = Math.max(0, Number((total - p).toFixed(2)));

    let status = 'ISSUED';
    if (balanceDue === 0 && total > 0) {
      status = 'PAID';
    } else if (p > 0 && balanceDue > 0) {
      status = 'PARTIALLY_PAID';
    }

    return { total, balanceDue, status };
  }

  async findByInvoiceNumber(invoiceNumber, agencyId = null) {
    const items = Array.from(this.inMemoryStore.values());
    const inv = items.find((item) => item.invoiceNumber === invoiceNumber && !item.deletedAt);
    if (!inv) return null;
    if (agencyId && inv.agencyId !== agencyId) return null;
    return JSON.parse(JSON.stringify(inv));
  }
}

export const invoiceRepository = new InvoiceRepository();
export default invoiceRepository;
