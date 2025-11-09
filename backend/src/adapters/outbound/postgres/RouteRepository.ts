import { Route, RouteCreateInput, RouteUpdateInput, RouteType } from '../../../core/domain/Route';
import { RouteRepository } from '../../../core/ports/RouteRepository';
import { prisma } from './prisma-client';

export class PrismaRouteRepository implements RouteRepository {
  async findById(id: string): Promise<Route | null> {
    const route = await prisma.route.findUnique({
      where: { id },
    });

    return route ? this.toDomain(route) : null;
  }

  async findAll(): Promise<Route[]> {
    const routes = await prisma.route.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return routes.map(this.toDomain);
  }

  async findByPorts(originPort: string, destinationPort: string): Promise<Route[]> {
    const routes = await prisma.route.findMany({
      where: {
        originPort,
        destinationPort,
      },
      orderBy: { createdAt: 'desc' },
    });

    return routes.map(this.toDomain);
  }

  async create(input: RouteCreateInput): Promise<Route> {
    const route = await prisma.route.create({
      data: {
        originPort: input.originPort,
        destinationPort: input.destinationPort,
        distance: input.distance,
        routeType: input.routeType as RouteType,
      },
    });

    return this.toDomain(route);
  }

  async update(id: string, input: RouteUpdateInput): Promise<Route> {
    const route = await prisma.route.update({
      where: { id },
      data: {
        ...(input.originPort !== undefined && { originPort: input.originPort }),
        ...(input.destinationPort !== undefined && { destinationPort: input.destinationPort }),
        ...(input.distance !== undefined && { distance: input.distance }),
        ...(input.routeType !== undefined && { routeType: input.routeType as RouteType }),
      },
    });

    return this.toDomain(route);
  }

  async delete(id: string): Promise<void> {
    await prisma.route.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.route.count({
      where: { id },
    });

    return count > 0;
  }

  private toDomain(route: {
    id: string;
    originPort: string;
    destinationPort: string;
    distance: number;
    routeType: string;
    createdAt: Date;
    updatedAt: Date;
  }): Route {
    return {
      id: route.id,
      originPort: route.originPort,
      destinationPort: route.destinationPort,
      distance: route.distance,
      routeType: route.routeType as RouteType,
      createdAt: route.createdAt,
      updatedAt: route.updatedAt,
    };
  }
}

