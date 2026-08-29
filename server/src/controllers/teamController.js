/**
 * Team Management Controller with Privilege Escalation Defenses
 * Task 28 — Step 2: Team Member CRUD
 */

import { teamMemberRepository } from '../repositories/teamMemberRepository.js';
import { auditService, AUDIT_ACTIONS } from '../services/auditService.js';
import { parsePaginationParams, paginateArray } from '../utils/pagination.js';
import { validator } from '../utils/validation.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';
import { ROLES } from '../middleware/auth.js';

export async function listTeam(req, res, next) {
  try {
    const pagination = parsePaginationParams(req.query);
    const { department, role, status } = req.query;

    let members = await teamMemberRepository.findMany({}, req.agencyId);

    if (department && department !== 'all') {
      members = members.filter((m) => m.department.toLowerCase() === department.toLowerCase());
    }
    if (role && role !== 'all') {
      members = members.filter((m) => m.role.toLowerCase() === role.toLowerCase());
    }
    if (status && status !== 'all') {
      members = members.filter((m) => m.status.toLowerCase() === status.toLowerCase());
    }

    const result = paginateArray(members, pagination);
    return sendSuccess(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function createMember(req, res, next) {
  try {
    if (req.user.role !== ROLES.OWNER && req.user.role !== ROLES.ADMIN) {
      throw new AuthorizationError('Insufficient privileges: Only OWNER or ADMIN can create team members.');
    }

    const { name, email, role, department, shiftHours } = req.body || {};
    validator.validateString(name, 'name', 2, 100);
    validator.validateEmail(email, 'email');
    const validRole = validator.validateEnum(role, Object.values(ROLES), 'role');

    // Privilege escalation defense: ADMIN cannot create an OWNER
    if (validRole === ROLES.OWNER && req.user.role !== ROLES.OWNER) {
      throw new AuthorizationError('Privilege escalation blocked: Only an existing OWNER can assign the OWNER role.');
    }

    const newMember = await teamMemberRepository.create({
      agencyId: req.agencyId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: validRole,
      department: department ? String(department).trim() : 'General Operations',
      shiftHours: shiftHours ? String(shiftHours).trim() : '09:00 - 18:00',
      status: 'ACTIVE',
    });

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'TEAM_MEMBER',
      entityId: newMember.id,
      before: null,
      after: newMember,
      requestId: req.id,
    });

    return sendSuccess(res, { member: newMember }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateMember(req, res, next) {
  try {
    const { memberId } = req.params;
    validator.validateId(memberId, 'memberId');

    const existing = await teamMemberRepository.findById(memberId, req.agencyId);
    if (!existing) {
      const existsInOther = await teamMemberRepository.findById(memberId);
      if (existsInOther) {
        throw new AuthorizationError('Tenant isolation violation: Cannot update external agency team member.');
      }
      throw new NotFoundError(`Team member with ID "${memberId}" not found.`);
    }

    // Privilege escalation defense
    if (req.user.role === ROLES.VIEWER || req.user.role === ROLES.OPERATOR) {
      throw new AuthorizationError('Insufficient privileges: Viewers and Operators cannot modify team member roles.');
    }

    const { name, email, role, department, shiftHours, status } = req.body || {};
    const updates = {};

    if (name !== undefined) updates.name = validator.validateString(name, 'name', 2, 100);
    if (email !== undefined) updates.email = validator.validateEmail(email, 'email');
    if (department !== undefined) updates.department = String(department).trim();
    if (shiftHours !== undefined) updates.shiftHours = String(shiftHours).trim();
    if (status !== undefined) updates.status = validator.validateEnum(status, ['ACTIVE', 'ON_LEAVE', 'INACTIVE'], 'status');

    if (role !== undefined) {
      const targetRole = validator.validateEnum(role, Object.values(ROLES), 'role');
      if (targetRole === ROLES.OWNER && req.user.role !== ROLES.OWNER) {
        throw new AuthorizationError('Privilege escalation blocked: Only an OWNER can promote users to OWNER.');
      }
      updates.role = targetRole;
    }

    const updated = await teamMemberRepository.update(memberId, updates, req.agencyId);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'TEAM_MEMBER',
      entityId: memberId,
      before: existing,
      after: updated,
      requestId: req.id,
    });

    return sendSuccess(res, { member: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteMember(req, res, next) {
  try {
    const { memberId } = req.params;
    validator.validateId(memberId, 'memberId');

    if (req.user.role !== ROLES.OWNER && req.user.role !== ROLES.ADMIN) {
      throw new AuthorizationError('Insufficient privileges: Only OWNER or ADMIN can remove team members.');
    }

    const existing = await teamMemberRepository.findById(memberId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`Team member with ID "${memberId}" not found.`);
    }

    await teamMemberRepository.delete(memberId, req.agencyId, true);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: 'TEAM_MEMBER',
      entityId: memberId,
      before: existing,
      after: { ...existing, deletedAt: new Date() },
      requestId: req.id,
    });

    return sendSuccess(res, { message: `Team member "${existing.name}" removed successfully.` });
  } catch (err) {
    next(err);
  }
}

export const teamController = {
  listTeam,
  createMember,
  updateMember,
  deleteMember,
};

export default teamController;
