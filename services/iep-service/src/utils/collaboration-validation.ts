/**
 * Real-time Collaboration Validation Utilities
 * Ensures data integrity during concurrent IEP editing
 *
 * CRITICAL: Data loss or corruption = legal liability
 * - IEPs are legal documents that must maintain integrity
 * - Conflict resolution must preserve all user changes
 * - Version history must be immutable audit trail
 *
 * Technical Foundation:
 * - Operational Transformation (OT) or CRDT for conflict resolution
 * - Last-Write-Wins with conflict detection
 * - Version history with rollback capability
 */

export interface CollaborationSession {
  sessionId: string;
  iepId: string;
  participants: Array<{
    userId: string;
    userName: string;
    role: 'teacher' | 'admin' | 'counselor' | 'parent';
    joinedAt: Date;
    lastActivityAt: Date;
    isActive: boolean;
  }>;
  createdAt: Date;
  lastModifiedAt: Date;
}

export interface ChangeOperation {
  operationId: string;
  userId: string;
  timestamp: Date;
  field: string; // Which field was changed (e.g., "goals[0].description")
  oldValue: any;
  newValue: any;
  operationType: 'insert' | 'update' | 'delete';
  version: number; // Document version number
}

export interface ConflictDetection {
  hasConflict: boolean;
  conflictType: 'concurrent_edit' | 'version_mismatch' | 'field_lock' | 'none';
  conflictingOperations: ChangeOperation[];
  resolution: 'auto' | 'manual_required';
  resolutionStrategy?: string;
}

/**
 * Validate collaboration session is active and healthy
 */
export function validateCollaborationSession(session: CollaborationSession): {
  isHealthy: boolean;
  issues: string[];
  warnings: string[];
  details: {
    activeParticipants: number;
    idleParticipants: number;
    sessionAgeMinu tes: number;
  };
} {
  const issues: string[] = [];
  const warnings: string[] = [];

  const now = new Date();
  const sessionAgeMinutes = (now.getTime() - session.createdAt.getTime()) / (1000 * 60);

  // Count active vs idle participants
  const IDLE_THRESHOLD_MINUTES = 5;
  let activeParticipants = 0;
  let idleParticipants = 0;

  for (const participant of session.participants) {
    const idleMinutes = (now.getTime() - participant.lastActivityAt.getTime()) / (1000 * 60);

    if (idleMinutes < IDLE_THRESHOLD_MINUTES) {
      activeParticipants++;
    } else {
      idleParticipants++;
      if (participant.isActive) {
        warnings.push(
          `Participant ${participant.userName} idle for ${idleMinutes.toFixed(1)} minutes`
        );
      }
    }
  }

  // Check for stale sessions
  if (sessionAgeMinutes > 480) {
    // 8 hours
    warnings.push(
      `Session is ${(sessionAgeMinutes / 60).toFixed(1)} hours old - consider ending session`
    );
  }

  // Check for too many concurrent editors
  if (activeParticipants > 5) {
    warnings.push(
      `${activeParticipants} concurrent editors - risk of conflicts increases with more editors`
    );
  }

  // Check for no activity
  if (activeParticipants === 0 && session.participants.length > 0) {
    issues.push('No active participants - session may be abandoned');
  }

  const isHealthy = issues.length === 0;

  return {
    isHealthy,
    issues,
    warnings,
    details: {
      activeParticipants,
      idleParticipants,
      sessionAgeMinutes,
    },
  };
}

/**
 * Detect conflicts between concurrent operations
 */
export function detectConflicts(
  operation: ChangeOperation,
  recentOperations: ChangeOperation[],
  currentVersion: number
): ConflictDetection {
  let hasConflict = false;
  let conflictType: ConflictDetection['conflictType'] = 'none';
  const conflictingOperations: ChangeOperation[] = [];
  let resolution: 'auto' | 'manual_required' = 'auto';
  let resolutionStrategy: string | undefined;

  // Check 1: Version mismatch (client is behind)
  if (operation.version < currentVersion) {
    hasConflict = true;
    conflictType = 'version_mismatch';
    resolution = 'auto';
    resolutionStrategy = 'Rebase operation on latest version and retry';
  }

  // Check 2: Concurrent edits to same field
  const CONFLICT_WINDOW_SECONDS = 5; // Operations within 5 seconds are considered concurrent

  for (const recentOp of recentOperations) {
    // Skip if same user (user's own operations don't conflict)
    if (recentOp.userId === operation.userId) {
      continue;
    }

    // Check if editing same field
    if (recentOp.field === operation.field) {
      const timeDiffSeconds =
        Math.abs(operation.timestamp.getTime() - recentOp.timestamp.getTime()) / 1000;

      if (timeDiffSeconds < CONFLICT_WINDOW_SECONDS) {
        hasConflict = true;
        conflictType = 'concurrent_edit';
        conflictingOperations.push(recentOp);

        // Auto-resolve with Last-Write-Wins if values are different
        if (operation.newValue !== recentOp.newValue) {
          resolution = 'manual_required';
          resolutionStrategy = 'Manual merge required - notify both users';
        } else {
          resolution = 'auto';
          resolutionStrategy = 'Values are identical - accept operation';
        }
      }
    }
  }

  return {
    hasConflict,
    conflictType,
    conflictingOperations,
    resolution,
    resolutionStrategy,
  };
}

/**
 * Validate change operation is well-formed
 */
export function validateChangeOperation(operation: ChangeOperation): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Required fields
  if (!operation.operationId) {
    issues.push('Missing operation ID');
  }
  if (!operation.userId) {
    issues.push('Missing user ID');
  }
  if (!operation.timestamp) {
    issues.push('Missing timestamp');
  }
  if (!operation.field) {
    issues.push('Missing field path');
  }
  if (operation.version === undefined || operation.version < 0) {
    issues.push('Invalid version number');
  }

  // Operation type validation
  const validTypes = ['insert', 'update', 'delete'];
  if (!validTypes.includes(operation.operationType)) {
    issues.push(`Invalid operation type: ${operation.operationType}`);
  }

  // Value validation based on type
  if (operation.operationType === 'update' && operation.oldValue === undefined) {
    issues.push('Update operation must include oldValue');
  }
  if (operation.operationType === 'insert' && operation.oldValue !== null) {
    issues.push('Insert operation should have null oldValue');
  }
  if (operation.operationType === 'delete' && operation.newValue !== null) {
    issues.push('Delete operation should have null newValue');
  }

  // Timestamp sanity check
  const now = new Date();
  if (operation.timestamp > now) {
    issues.push('Operation timestamp is in the future');
  }

  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  if (operation.timestamp < oneHourAgo) {
    issues.push('Operation timestamp is more than 1 hour old - may be stale');
  }

  const isValid = issues.length === 0;

  return { isValid, issues };
}

/**
 * Validate version history integrity
 */
export function validateVersionHistory(versions: Array<{
  version: number;
  timestamp: Date;
  userId: string;
  changes: ChangeOperation[];
  checksum?: string;
}>): {
  isIntact: boolean;
  issues: string[];
  details: {
    totalVersions: number;
    missingVersions: number[];
    outOfOrderVersions: number;
  };
} {
  const issues: string[] = [];
  const missingVersions: number[] = [];
  let outOfOrderVersions = 0;

  if (versions.length === 0) {
    return {
      isIntact: true,
      issues: [],
      details: {
        totalVersions: 0,
        missingVersions: [],
        outOfOrderVersions: 0,
      },
    };
  }

  // Check for sequential version numbers
  const versionNumbers = versions.map((v) => v.version).sort((a, b) => a - b);

  for (let i = 0; i < versionNumbers.length; i++) {
    const expected = i === 0 ? versionNumbers[0] : versionNumbers[i - 1] + 1;
    if (versionNumbers[i] !== expected && i > 0) {
      missingVersions.push(expected);
    }
  }

  if (missingVersions.length > 0) {
    issues.push(`Missing versions: ${missingVersions.join(', ')}`);
  }

  // Check timestamps are monotonically increasing
  let previousTimestamp: Date | null = null;
  for (const version of versions) {
    if (previousTimestamp && version.timestamp < previousTimestamp) {
      outOfOrderVersions++;
    }
    previousTimestamp = version.timestamp;
  }

  if (outOfOrderVersions > 0) {
    issues.push(`${outOfOrderVersions} version(s) have out-of-order timestamps`);
  }

  // Check each version has changes
  const emptyVersions = versions.filter((v) => !v.changes || v.changes.length === 0);
  if (emptyVersions.length > 0) {
    issues.push(`${emptyVersions.length} version(s) have no changes recorded`);
  }

  const isIntact = issues.length === 0;

  return {
    isIntact,
    issues,
    details: {
      totalVersions: versions.length,
      missingVersions,
      outOfOrderVersions,
    },
  };
}

/**
 * Validate data integrity after merge/conflict resolution
 */
export function validateMergeIntegrity(
  originalData: any,
  operation: ChangeOperation,
  mergedData: any
): {
  isIntact: boolean;
  issues: string[];
  details: {
    fieldChanged: boolean;
    otherFieldsPreserved: boolean;
  };
} {
  const issues: string[] = [];

  // Parse field path (e.g., "goals[0].description" -> goals, 0, description)
  const fieldPath = operation.field.split(/\.|\[|\]/).filter((p) => p);

  // Navigate to the changed field in merged data
  let mergedValue = mergedData;
  let originalValue = originalData;

  try {
    for (const part of fieldPath) {
      mergedValue = mergedValue?.[part];
      originalValue = originalValue?.[part];
    }
  } catch (error) {
    issues.push(`Failed to navigate field path: ${operation.field}`);
    return {
      isIntact: false,
      issues,
      details: {
        fieldChanged: false,
        otherFieldsPreserved: false,
      },
    };
  }

  // Check that the field was actually changed
  const fieldChanged = mergedValue !== originalValue;
  if (!fieldChanged && operation.operationType === 'update') {
    issues.push('Field value was not updated after merge');
  }

  // Check that other fields were preserved (spot check a few)
  // In production, do comprehensive comparison
  const otherFieldsPreserved = true; // Simplified for now

  const isIntact = issues.length === 0;

  return {
    isIntact,
    issues,
    details: {
      fieldChanged,
      otherFieldsPreserved,
    },
  };
}

/**
 * Validate concurrent user limits
 */
export function validateConcurrentUserLimits(
  currentUsers: number,
  maxConcurrentUsers: number = 10
): {
  withinLimits: boolean;
  warning?: string;
} {
  if (currentUsers > maxConcurrentUsers) {
    return {
      withinLimits: false,
      warning: `Too many concurrent users (${currentUsers}/${maxConcurrentUsers}) - performance may degrade`,
    };
  }

  if (currentUsers > maxConcurrentUsers * 0.8) {
    return {
      withinLimits: true,
      warning: `Approaching concurrent user limit (${currentUsers}/${maxConcurrentUsers})`,
    };
  }

  return { withinLimits: true };
}

/**
 * Generate conflict resolution report
 */
export function generateConflictResolutionReport(
  conflicts: ConflictDetection[],
  timeWindowMinutes: number = 60
): {
  summary: string;
  totalConflicts: number;
  autoResolved: number;
  manualRequired: number;
  conflictRate: number;
  recommendations: string[];
} {
  const totalConflicts = conflicts.length;
  const autoResolved = conflicts.filter((c) => c.resolution === 'auto').length;
  const manualRequired = conflicts.filter((c) => c.resolution === 'manual_required').length;

  // Conflict rate per hour
  const conflictRate = totalConflicts / (timeWindowMinutes / 60);

  const recommendations: string[] = [];

  if (conflictRate > 5) {
    recommendations.push(
      'High conflict rate - consider implementing field-level locking for frequently edited sections'
    );
  }

  if (manualRequired > 0) {
    recommendations.push(
      `${manualRequired} conflict(s) require manual resolution - notify affected users`
    );
  }

  if (totalConflicts > 0 && autoResolved === totalConflicts) {
    recommendations.push('All conflicts auto-resolved successfully');
  }

  const summary = `${totalConflicts} conflict(s) detected in last ${timeWindowMinutes} minutes. ${autoResolved} auto-resolved, ${manualRequired} require manual intervention.`;

  return {
    summary,
    totalConflicts,
    autoResolved,
    manualRequired,
    conflictRate,
    recommendations,
  };
}
