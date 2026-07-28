/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MCU-PKPM CMS User Management & RBAC API Routes
 */

import { Router, Request, Response } from 'express';
import { readDB, writeDB, sha256, sanitizeUser, logAuditAction } from '../services/db.service';
import { sendStandardResponse, validatePayload, applyPaginationSearchSortFilter } from '../middleware/responseFormatter';
import { RoleName, Permission, ROLE_DEFINITIONS } from '../../src/types';

export const usersRouter = Router();

// ============================================================================
// 1. GET ALL USERS (GET /api/users)
// ============================================================================
usersRouter.get('/users', (req: Request, res: Response) => {
  try {
    const db = readDB();
    const rawUsers = db.users || [];
    
    // Apply pagination, search and sort
    const result = applyPaginationSearchSortFilter(rawUsers, req, ['name', 'username', 'email', 'department', 'role'], ['role', 'status', 'department']);
    
    // Sanitize user passwords
    const sanitizedItems = result.items.map(u => sanitizeUser(u));

    sendStandardResponse(res, 200, {
      success: true,
      data: sanitizedItems,
      meta: result.meta
    });
  } catch (err: any) {
    sendStandardResponse(res, 500, {
      success: false,
      error: { code: 'FETCH_USERS_FAILED', message: err.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้' }
    });
  }
});

// ============================================================================
// 2. GET USER BY ID (GET /api/users/:id)
// ============================================================================
usersRouter.get('/users/:id', (req: Request, res: Response) => {
  try {
    const db = readDB();
    const targetId = req.params.id;
    const user = (db.users || []).find((u: any) => u.id === targetId || u.username === targetId);

    if (!user) {
      sendStandardResponse(res, 404, {
        success: false,
        error: { code: 'USER_NOT_FOUND', message: `ไม่พบบัญชีผู้ใช้งาน ID: ${targetId}` }
      });
      return;
    }

    sendStandardResponse(res, 200, {
      success: true,
      data: sanitizeUser(user)
    });
  } catch (err: any) {
    sendStandardResponse(res, 500, {
      success: false,
      error: { code: 'FETCH_USER_FAILED', message: err.message || 'ไม่สามารถดึงข้อมูลผู้ใช้งานได้' }
    });
  }
});

// ============================================================================
// 3. CREATE USER & ASSIGN RBAC PERMISSIONS (POST /api/users)
// ============================================================================
usersRouter.post('/users', (req: Request, res: Response) => {
  try {
    const payload = req.body || {};
    const validationErrors = validatePayload(payload, {
      required: ['username', 'name', 'password', 'role'],
      types: { username: 'string', name: 'string', password: 'string', role: 'string' }
    });

    if (validationErrors.length > 0) {
      sendStandardResponse(res, 400, {
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: validationErrors[0].message, details: validationErrors }
      });
      return;
    }

    const db = readDB();
    db.users = db.users || [];

    const usernameClean = payload.username.trim().toLowerCase();
    const emailClean = (payload.email || `${usernameClean}@mcukp.ac.th`).trim().toLowerCase();

    // Check Duplicate Username or Email
    const existingUser = db.users.find(
      (u: any) => u.username.toLowerCase() === usernameClean || (u.email && u.email.toLowerCase() === emailClean)
    );

    if (existingUser) {
      sendStandardResponse(res, 400, {
        success: false,
        error: { code: 'DUPLICATE_USER', message: `ชื่อผู้ใช้ "${usernameClean}" หรืออีเมลนี้มีในระบบแล้ว` }
      });
      return;
    }

    const roleName = (payload.role as RoleName) || 'Viewer';
    const roleDef = ROLE_DEFINITIONS[roleName];
    const defaultPerms = roleDef ? roleDef.defaultPermissions : ['view'];
    const customPermissions = Array.isArray(payload.customPermissions) ? payload.customPermissions : defaultPerms;

    const newUserId = 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newUser = {
      id: newUserId,
      username: usernameClean,
      passwordHash: sha256(payload.password),
      name: payload.name.trim(),
      email: emailClean,
      department: (payload.department || 'สำนักงานวิทยาลัย').trim(),
      role: roleName,
      customPermissions,
      status: (payload.status as 'active' | 'inactive') || 'active',
      avatarUrl: payload.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${usernameClean}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: '',
      mustChangePassword: payload.mustChangePassword || false,
      is2FAEnabled: false
    };

    db.users.unshift(newUser);
    writeDB(db);

    // Audit Log Action
    logAuditAction('admin', 'system', 'CREATE_USER', 'RBAC', newUser.id, {
      username: newUser.username,
      name: newUser.name,
      role: newUser.role,
      permissionsCount: customPermissions.length
    }, req.ip);

    sendStandardResponse(res, 201, {
      success: true,
      data: sanitizeUser(newUser)
    });
  } catch (err: any) {
    sendStandardResponse(res, 500, {
      success: false,
      error: { code: 'CREATE_USER_FAILED', message: err.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งานใหม่' }
    });
  }
});

// ============================================================================
// 4. UPDATE USER & PERMISSIONS (PUT /api/users/:id)
// ============================================================================
usersRouter.put('/users/:id', (req: Request, res: Response) => {
  try {
    const targetId = req.params.id;
    const payload = req.body || {};
    const db = readDB();
    db.users = db.users || [];

    const userIndex = db.users.findIndex((u: any) => u.id === targetId || u.username === targetId);
    if (userIndex === -1) {
      sendStandardResponse(res, 404, {
        success: false,
        error: { code: 'USER_NOT_FOUND', message: `ไม่พบบัญชีผู้ใช้งาน ID: ${targetId}` }
      });
      return;
    }

    const existingUser = db.users[userIndex];

    // If updating role, update permissions default if customPermissions not passed
    let updatedRole = payload.role || existingUser.role;
    let updatedPermissions = Array.isArray(payload.customPermissions) 
      ? payload.customPermissions 
      : existingUser.customPermissions || (ROLE_DEFINITIONS[updatedRole as RoleName]?.defaultPermissions || ['view']);

    // If new password provided
    let updatedPasswordHash = existingUser.passwordHash;
    if (payload.password && payload.password.trim().length > 0) {
      updatedPasswordHash = sha256(payload.password.trim());
    }

    const updatedUser = {
      ...existingUser,
      name: payload.name ? payload.name.trim() : existingUser.name,
      email: payload.email ? payload.email.trim().toLowerCase() : existingUser.email,
      department: payload.department ? payload.department.trim() : existingUser.department,
      role: updatedRole,
      customPermissions: updatedPermissions,
      status: payload.status || existingUser.status,
      passwordHash: updatedPasswordHash,
      updatedAt: new Date().toISOString()
    };

    db.users[userIndex] = updatedUser;
    writeDB(db);

    logAuditAction('admin', 'system', 'UPDATE_USER', 'RBAC', updatedUser.id, {
      username: updatedUser.username,
      role: updatedUser.role,
      status: updatedUser.status
    }, req.ip);

    sendStandardResponse(res, 200, {
      success: true,
      data: sanitizeUser(updatedUser)
    });
  } catch (err: any) {
    sendStandardResponse(res, 500, {
      success: false,
      error: { code: 'UPDATE_USER_FAILED', message: err.message || 'ไม่สามารถอัปเดตข้อมูลผู้ใช้งานได้' }
    });
  }
});

// ============================================================================
// 5. UPDATE GRANULAR PERMISSIONS ONLY (PUT /api/users/:id/permissions)
// ============================================================================
usersRouter.put('/users/:id/permissions', (req: Request, res: Response) => {
  try {
    const targetId = req.params.id;
    const { customPermissions } = req.body || {};

    if (!Array.isArray(customPermissions)) {
      sendStandardResponse(res, 400, {
        success: false,
        error: { code: 'INVALID_PERMISSIONS', message: 'กรุณาระบุรายการสิทธิ์ customPermissions เป็น Array' }
      });
      return;
    }

    const db = readDB();
    const userIndex = (db.users || []).findIndex((u: any) => u.id === targetId || u.username === targetId);

    if (userIndex === -1) {
      sendStandardResponse(res, 404, {
        success: false,
        error: { code: 'USER_NOT_FOUND', message: `ไม่พบบัญชีผู้ใช้งาน ID: ${targetId}` }
      });
      return;
    }

    db.users[userIndex].customPermissions = customPermissions;
    db.users[userIndex].updatedAt = new Date().toISOString();
    writeDB(db);

    logAuditAction('admin', 'system', 'UPDATE_USER_PERMISSIONS', 'RBAC', targetId, {
      username: db.users[userIndex].username,
      permissionsCount: customPermissions.length
    }, req.ip);

    sendStandardResponse(res, 200, {
      success: true,
      data: sanitizeUser(db.users[userIndex])
    });
  } catch (err: any) {
    sendStandardResponse(res, 500, {
      success: false,
      error: { code: 'UPDATE_PERMISSIONS_FAILED', message: err.message || 'ไม่สามารถอัปเดตสิทธิ์การใช้งานได้' }
    });
  }
});

// ============================================================================
// 6. DELETE USER ACCOUNT (DELETE /api/users/:id)
// ============================================================================
usersRouter.delete('/users/:id', (req: Request, res: Response) => {
  try {
    const targetId = req.params.id;
    const db = readDB();
    db.users = db.users || [];

    const userIndex = db.users.findIndex((u: any) => u.id === targetId || u.username === targetId);

    if (userIndex === -1) {
      sendStandardResponse(res, 404, {
        success: false,
        error: { code: 'USER_NOT_FOUND', message: `ไม่พบบัญชีผู้ใช้งาน ID: ${targetId}` }
      });
      return;
    }

    const targetUser = db.users[userIndex];

    // Prevent deleting Super Admin if it's the only one left
    const superAdminsCount = db.users.filter((u: any) => u.role === 'Super Admin').length;
    if (targetUser.role === 'Super Admin' && superAdminsCount <= 1) {
      sendStandardResponse(res, 403, {
        success: false,
        error: { code: 'PROTECTED_USER', message: 'ไม่สามารถลบบัญชี Super Admin หลักของระบบได้' }
      });
      return;
    }

    db.users.splice(userIndex, 1);
    writeDB(db);

    logAuditAction('admin', 'system', 'DELETE_USER', 'RBAC', targetId, {
      username: targetUser.username,
      name: targetUser.name
    }, req.ip);

    sendStandardResponse(res, 200, {
      success: true,
      data: { deletedId: targetId, username: targetUser.username }
    });
  } catch (err: any) {
    sendStandardResponse(res, 500, {
      success: false,
      error: { code: 'DELETE_USER_FAILED', message: err.message || 'ไม่สามารถลบบัญชีผู้ใช้งานได้' }
    });
  }
});
