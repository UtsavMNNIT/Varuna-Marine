import { Pool, PoolCreateInput, PoolType, PoolStatus } from '../../core/domain/Pool';

/**
 * Creates a pool from input data.
 * Pure function with no side effects - returns pool data structure.
 */
export interface CreatePoolResult {
  pool: Pool;
}

export interface CreatePoolUseCaseInput extends PoolCreateInput {
  id: string;
  createdAt: Date;
}

/**
 * Creates a pool from input data.
 * Validates input and returns a pool entity.
 * Pure function with no side effects.
 */
export function createPool(input: CreatePoolUseCaseInput): CreatePoolResult {
  const { id, name, description, poolType, startDate, endDate, createdAt } = input;

  // Validation
  if (startDate >= endDate) {
    throw new Error('Start date must be before end date');
  }

  if (name.trim().length === 0) {
    throw new Error('Pool name cannot be empty');
  }

  const pool: Pool = {
    id,
    name: name.trim(),
    description: description?.trim(),
    poolType,
    status: PoolStatus.PENDING,
    startDate,
    endDate,
    totalComplianceUnits: 0,
    allocatedComplianceUnits: 0,
    createdAt,
    updatedAt: createdAt,
  };

  return {
    pool,
  };
}

