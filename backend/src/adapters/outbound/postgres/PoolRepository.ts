import {
  Pool,
  PoolCreateInput,
  PoolUpdateInput,
  PoolMember,
  PoolAllocation,
  PoolStatus,
  PoolType,
} from '../../../core/domain/Pool';
import { PoolRepository } from '../../../core/ports/PoolRepository';
import { prisma } from './prisma-client';

export class PrismaPoolRepository implements PoolRepository {
  async findById(id: string): Promise<Pool | null> {
    const pool = await prisma.pool.findUnique({
      where: { id },
    });

    return pool ? this.toDomain(pool) : null;
  }

  async findAll(): Promise<Pool[]> {
    const pools = await prisma.pool.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return pools.map(this.toDomain);
  }

  async findByStatus(status: PoolStatus): Promise<Pool[]> {
    const pools = await prisma.pool.findMany({
      where: { status: status as PoolStatus },
      orderBy: { createdAt: 'desc' },
    });

    return pools.map(this.toDomain);
  }

  async findByShipId(shipId: string): Promise<Pool[]> {
    const poolMembers = await prisma.poolMember.findMany({
      where: { shipId },
      include: { pool: true },
    });

    return poolMembers.map((pm) => this.toDomain(pm.pool));
  }

  async findActivePools(): Promise<Pool[]> {
    const pools = await prisma.pool.findMany({
      where: { status: PoolStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });

    return pools.map(this.toDomain);
  }

  async create(input: PoolCreateInput): Promise<Pool> {
    const pool = await prisma.pool.create({
      data: {
        name: input.name,
        description: input.description,
        poolType: input.poolType as PoolType,
        startDate: input.startDate,
        endDate: input.endDate,
      },
    });

    return this.toDomain(pool);
  }

  async update(id: string, input: PoolUpdateInput): Promise<Pool> {
    const pool = await prisma.pool.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.poolType !== undefined && { poolType: input.poolType as PoolType }),
        ...(input.status !== undefined && { status: input.status as PoolStatus }),
        ...(input.startDate !== undefined && { startDate: input.startDate }),
        ...(input.endDate !== undefined && { endDate: input.endDate }),
      },
    });

    return this.toDomain(pool);
  }

  async delete(id: string): Promise<void> {
    await prisma.pool.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.pool.count({
      where: { id },
    });

    return count > 0;
  }

  async addMember(poolId: string, shipId: string, units: number): Promise<PoolMember> {
    // Get pool to calculate contribution
    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
    });

    if (!pool) {
      throw new Error(`Pool with id ${poolId} not found`);
    }

    const totalUnits = pool.totalComplianceUnits || 1; // Avoid division by zero
    const contribution = (units / totalUnits) * 100;

    const member = await prisma.poolMember.create({
      data: {
        poolId,
        shipId,
        allocatedUnits: units,
        contribution,
      },
    });

    // Update pool's allocated units
    await prisma.pool.update({
      where: { id: poolId },
      data: {
        allocatedComplianceUnits: {
          increment: units,
        },
      },
    });

    return this.memberToDomain(member);
  }

  async removeMember(poolId: string, shipId: string): Promise<void> {
    const member = await prisma.poolMember.findUnique({
      where: {
        poolId_shipId: {
          poolId,
          shipId,
        },
      },
    });

    if (member) {
      // Update pool's allocated units before deleting
      await prisma.pool.update({
        where: { id: poolId },
        data: {
          allocatedComplianceUnits: {
            decrement: member.allocatedUnits,
          },
        },
      });

      await prisma.poolMember.delete({
        where: {
          poolId_shipId: {
            poolId,
            shipId,
          },
        },
      });
    }
  }

  async getMembers(poolId: string): Promise<PoolMember[]> {
    const members = await prisma.poolMember.findMany({
      where: { poolId },
      orderBy: { joinedAt: 'asc' },
    });

    return members.map(this.memberToDomain);
  }

  async allocateUnits(allocation: PoolAllocation): Promise<void> {
    const member = await prisma.poolMember.findUnique({
      where: {
        poolId_shipId: {
          poolId: allocation.poolId,
          shipId: allocation.shipId,
        },
      },
    });

    if (member) {
      // Update existing member's allocated units
      await prisma.poolMember.update({
        where: {
          poolId_shipId: {
            poolId: allocation.poolId,
            shipId: allocation.shipId,
          },
        },
        data: {
          allocatedUnits: {
            increment: allocation.units,
          },
        },
      });

      // Update pool's allocated units
      await prisma.pool.update({
        where: { id: allocation.poolId },
        data: {
          allocatedComplianceUnits: {
            increment: allocation.units,
          },
        },
      });
    } else {
      // Create new member if doesn't exist
      await this.addMember(allocation.poolId, allocation.shipId, allocation.units);
    }
  }

  async getTotalAllocatedUnits(poolId: string): Promise<number> {
    const result = await prisma.poolMember.aggregate({
      where: { poolId },
      _sum: {
        allocatedUnits: true,
      },
    });

    return result._sum.allocatedUnits || 0;
  }

  private toDomain(pool: {
    id: string;
    name: string;
    description: string | null;
    poolType: string;
    status: string;
    startDate: Date;
    endDate: Date;
    totalComplianceUnits: number;
    allocatedComplianceUnits: number;
    createdAt: Date;
    updatedAt: Date;
  }): Pool {
    return {
      id: pool.id,
      name: pool.name,
      description: pool.description ?? undefined,
      poolType: pool.poolType as PoolType,
      status: pool.status as PoolStatus,
      startDate: pool.startDate,
      endDate: pool.endDate,
      totalComplianceUnits: pool.totalComplianceUnits,
      allocatedComplianceUnits: pool.allocatedComplianceUnits,
      createdAt: pool.createdAt,
      updatedAt: pool.updatedAt,
    };
  }

  private memberToDomain(member: {
    id: string;
    poolId: string;
    shipId: string;
    allocatedUnits: number;
    contribution: number;
    joinedAt: Date;
  }): PoolMember {
    return {
      id: member.id,
      poolId: member.poolId,
      shipId: member.shipId,
      allocatedUnits: member.allocatedUnits,
      contribution: member.contribution,
      joinedAt: member.joinedAt,
    };
  }
}

