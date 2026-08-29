/**
 * WhatsApp Conversation & Message Repository
 * Task 28 — Step 3: WhatsApp Inbox & Message Store
 */

import { BaseRepository } from './baseRepository.js';

export class ConversationRepository extends BaseRepository {
  constructor() {
    super('Conversation');
    this.messagesStore = new Map();
    this.seedDefaultConversations();
  }

  seedDefaultConversations() {
    const demoAgencyId = 'agency-demo-001';
    const conversations = [
      {
        id: 'conv-101',
        agencyId: demoAgencyId,
        clientId: 'c1',
        contactId: 'contact-1',
        contactPhone: '+91 98765 43210',
        contactName: 'Rohit Sharma',
        unreadCount: 0,
        channel: 'WHATSAPP',
        status: 'OPEN',
        assignedTo: 'Rohan Gupta',
        tags: 'VIP, New Lead',
        lastMessage: 'Can you share the pricing for the annual enterprise fitness package?',
        lastMessageAt: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        id: 'conv-102',
        agencyId: demoAgencyId,
        clientId: 'c2',
        contactId: 'contact-2',
        contactPhone: '+91 98765 43211',
        contactName: 'Priya Nair',
        unreadCount: 2,
        channel: 'WHATSAPP',
        status: 'PENDING',
        assignedTo: 'Rohan Gupta',
        tags: 'D2C Organic, Order Query',
        lastMessage: 'Do you offer bulk delivery subscriptions in Mumbai?',
        lastMessageAt: new Date(Date.now() - 45 * 60 * 1000),
      },
      {
        id: 'conv-isolated-99',
        agencyId: 'agency-demo-002',
        clientId: 'c-isolated-99',
        contactPhone: '+91 99999 00000',
        contactName: 'Secret Agent',
        unreadCount: 1,
        channel: 'WHATSAPP',
        status: 'OPEN',
        assignedTo: 'Isolated Operator',
        tags: 'Confidential',
        lastMessage: 'Isolated tenant message payload',
        lastMessageAt: new Date(),
      },
    ];

    for (const c of conversations) {
      this.inMemoryStore.set(c.id, {
        ...c,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }

    // Seed Messages
    const messages = [
      {
        id: 'msg-1',
        agencyId: demoAgencyId,
        conversationId: 'conv-101',
        direction: 'INBOUND',
        messageType: 'text',
        body: 'Hello! I saw your recent campaign for Apex Fitness.',
        status: 'READ',
        createdAt: new Date(Date.now() - 20 * 60 * 1000),
      },
      {
        id: 'msg-2',
        agencyId: demoAgencyId,
        conversationId: 'conv-101',
        direction: 'OUTBOUND',
        messageType: 'text',
        body: 'Hi Rohit! Welcome to Apex Fitness. How can we assist you today?',
        status: 'READ',
        createdAt: new Date(Date.now() - 18 * 60 * 1000),
      },
      {
        id: 'msg-3',
        agencyId: demoAgencyId,
        conversationId: 'conv-101',
        direction: 'INBOUND',
        messageType: 'text',
        body: 'Can you share the pricing for the annual enterprise fitness package?',
        status: 'READ',
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
      },
    ];

    for (const m of messages) {
      this.messagesStore.set(m.id, {
        ...m,
        createdAt: m.createdAt || new Date(),
        updatedAt: new Date(),
      });
    }
  }

  async getMessages(conversationId, agencyId = null) {
    let msgs = Array.from(this.messagesStore.values()).filter((m) => m.conversationId === conversationId);
    if (agencyId) {
      msgs = msgs.filter((m) => m.agencyId === agencyId);
    }
    return msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async addMessage(messageData) {
    const id = messageData.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const msg = {
      ...messageData,
      id,
      createdAt: messageData.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.messagesStore.set(id, msg);

    // Update conversation lastMessage & lastMessageAt
    const conv = await this.findById(messageData.conversationId, messageData.agencyId);
    if (conv) {
      await this.update(
        conv.id,
        {
          lastMessage: messageData.body,
          lastMessageAt: msg.createdAt,
          unreadCount: messageData.direction === 'INBOUND' ? (conv.unreadCount || 0) + 1 : conv.unreadCount,
        },
        messageData.agencyId
      );
    }

    return msg;
  }
}

export const conversationRepository = new ConversationRepository();
export default conversationRepository;
