import {
  Compliance,
  ComplianceCreateInput,
  ComplianceUpdateInput,
  ComplianceMetrics,
  ComplianceStatus,
  FuelType,
} from '../../../core/domain/Compliance';
import { ComplianceRepository } from '../../../core/ports/ComplianceRepository';
import { prisma } from './prisma-client';

export class PrismaComplianceRepository implements ComplianceRepository {
  async findById(id: string): Promise<Compliance | null> {
    const compliance = await prisma.shipCompliance.findUnique({
      where: { id },
    });

    return compliance ? this.toDomain(compliance) : null;
  }

  async findAll(): Promise<Compliance[]> {
    const compliances = await prisma.shipCompliance.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return compliances.map(this.toDomain);
  }

  async findByShipId(shipId: string): Promise<Compliance[]> {
    const compliances = await prisma.shipCompliance.findMany({
      where: { shipId },
      orderBy: { createdAt: 'desc' },
    });

    return compliances.map(this.toDomain);
  }

  async findByRouteId(routeId: string): Promise<Compliance[]> {
    const compliances = await prisma.shipCompliance.findMany({
      where: { routeId },
      orderBy: { createdAt: 'desc' },
    });

    return compliances.map(this.toDomain);
  }

  async findByReportingPeriod(period: string): Promise<Compliance[]> {
    const compliances = await prisma.shipCompliance.findMany({
      where: { reportingPeriod: period },
      orderBy: { createdAt: 'desc' },
    });

    return compliances.map(this.toDomain);
  }

  async findByStatus(status: ComplianceStatus): Promise<Compliance[]> {
    const compliances = await prisma.shipCompliance.findMany({
      where: { complianceStatus: status as ComplianceStatus },
      orderBy: { createdAt: 'desc' },
    });

    return compliances.map(this.toDomain);
  }

  async getMetricsByShipId(shipId: string, period?: string): Promise<ComplianceMetrics> {
    const where: { shipId: string; reportingPeriod?: string } = { shipId };
    if (period) {
      where.reportingPeriod = period;
    }

    const compliances = await prisma.shipCompliance.findMany({
      where,
    });

    return this.calculateMetrics(compliances);
  }

  async getMetricsByRouteId(routeId: string, period?: string): Promise<ComplianceMetrics> {
    const where: { routeId: string; reportingPeriod?: string } = { routeId };
    if (period) {
      where.reportingPeriod = period;
    }

    const compliances = await prisma.shipCompliance.findMany({
      where,
    });

    return this.calculateMetrics(compliances);
  }

  async create(input: ComplianceCreateInput): Promise<Compliance> {
    const compliance = await prisma.shipCompliance.create({
      data: {
        shipId: input.shipId,
        routeId: input.routeId,
        voyageId: input.voyageId,
        fuelType: input.fuelType as FuelType,
        fuelConsumption: input.fuelConsumption,
        energyContent: input.energyContent,
        ghgIntensity: input.ghgIntensity,
        reportingPeriod: input.reportingPeriod,
      },
    });

    return this.toDomain(compliance);
  }

  async update(id: string, input: ComplianceUpdateInput): Promise<Compliance> {
    const compliance = await prisma.shipCompliance.update({
      where: { id },
      data: {
        ...(input.fuelType !== undefined && { fuelType: input.fuelType as FuelType }),
        ...(input.fuelConsumption !== undefined && { fuelConsumption: input.fuelConsumption }),
        ...(input.energyContent !== undefined && { energyContent: input.energyContent }),
        ...(input.ghgIntensity !== undefined && { ghgIntensity: input.ghgIntensity }),
        ...(input.complianceStatus !== undefined && {
          complianceStatus: input.complianceStatus as ComplianceStatus,
        }),
        ...(input.reportingPeriod !== undefined && { reportingPeriod: input.reportingPeriod }),
      },
    });

    return this.toDomain(compliance);
  }

  async delete(id: string): Promise<void> {
    await prisma.shipCompliance.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.shipCompliance.count({
      where: { id },
    });

    return count > 0;
  }

  private toDomain(compliance: {
    id: string;
    shipId: string;
    routeId: string;
    voyageId: string;
    fuelType: string;
    fuelConsumption: number;
    energyContent: number;
    ghgIntensity: number;
    complianceStatus: string;
    reportingPeriod: string;
    createdAt: Date;
    updatedAt: Date;
  }): Compliance {
    return {
      id: compliance.id,
      shipId: compliance.shipId,
      routeId: compliance.routeId,
      voyageId: compliance.voyageId,
      fuelType: compliance.fuelType as FuelType,
      fuelConsumption: compliance.fuelConsumption,
      energyContent: compliance.energyContent,
      ghgIntensity: compliance.ghgIntensity,
      complianceStatus: compliance.complianceStatus as ComplianceStatus,
      reportingPeriod: compliance.reportingPeriod,
      createdAt: compliance.createdAt,
      updatedAt: compliance.updatedAt,
    };
  }

  private calculateMetrics(compliances: Array<{
    fuelConsumption: number;
    energyContent: number;
    ghgIntensity: number;
    complianceStatus: string;
  }>): ComplianceMetrics {
    if (compliances.length === 0) {
      return {
        totalGhgEmissions: 0,
        averageGhgIntensity: 0,
        totalEnergyConsumed: 0,
        complianceRate: 0,
      };
    }

    const totalEnergyConsumed = compliances.reduce(
      (sum, c) => sum + c.energyContent,
      0
    );

    const totalGhgEmissions = compliances.reduce(
      (sum, c) => sum + c.energyContent * c.ghgIntensity,
      0
    );

    const averageGhgIntensity =
      totalEnergyConsumed > 0 ? totalGhgEmissions / totalEnergyConsumed : 0;

    const compliantCount = compliances.filter(
      (c) => c.complianceStatus === ComplianceStatus.COMPLIANT
    ).length;

    const complianceRate = (compliantCount / compliances.length) * 100;

    return {
      totalGhgEmissions,
      averageGhgIntensity,
      totalEnergyConsumed,
      complianceRate,
    };
  }
}

