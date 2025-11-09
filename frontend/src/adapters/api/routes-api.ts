import { apiClient } from './api-client';

export interface Route {
  id: string;
  originPort: string;
  destinationPort: string;
  distance: number;
  routeType: 'INTRA_EU' | 'EXTRA_EU' | 'MIXED';
  createdAt: string;
  updatedAt: string;
}

// Database route model (from Prisma)
interface DbRoute {
  id: string;
  vesselId: string;
  name: string;
  totalDistanceNauticalMiles: number;
  startDate: string;
  endDate: string | null;
  status: string;
  segments: {
    origin?: string;
    destination?: string;
    distanceKm?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRouteInput {
  originPort: string;
  destinationPort: string;
  distance: number;
  routeType: 'INTRA_EU' | 'EXTRA_EU' | 'MIXED';
}

export interface UpdateRouteInput {
  originPort?: string;
  destinationPort?: string;
  distance?: number;
  routeType?: 'INTRA_EU' | 'EXTRA_EU' | 'MIXED';
}

// Map database route to frontend Route format
function mapDbRouteToRoute(dbRoute: DbRoute): Route {
  const segments = typeof dbRoute.segments === 'object' && dbRoute.segments !== null 
    ? dbRoute.segments 
    : {};
  
  return {
    id: dbRoute.id,
    originPort: segments.origin || 'N/A',
    destinationPort: segments.destination || 'N/A',
    distance: dbRoute.totalDistanceNauticalMiles,
    routeType: 'INTRA_EU' as const, // Default, can be extracted from segments if needed
    createdAt: dbRoute.createdAt,
    updatedAt: dbRoute.updatedAt,
  };
}

export const routesApi = {
  getAll: async (params?: { originPort?: string; destinationPort?: string }): Promise<Route[]> => {
    const response = await apiClient.get('/routes', { params });
    // Backend returns array directly, not wrapped in { routes: [...] }
    const dbRoutes: DbRoute[] = Array.isArray(response.data) ? response.data : [];
    
    // Filter by params if provided
    let filtered = dbRoutes;
    if (params?.originPort) {
      filtered = filtered.filter(r => {
        const segments = typeof r.segments === 'object' && r.segments !== null ? r.segments : {};
        return segments.origin?.toLowerCase().includes(params.originPort!.toLowerCase());
      });
    }
    if (params?.destinationPort) {
      filtered = filtered.filter(r => {
        const segments = typeof r.segments === 'object' && r.segments !== null ? r.segments : {};
        return segments.destination?.toLowerCase().includes(params.destinationPort!.toLowerCase());
      });
    }
    
    return filtered.map(mapDbRouteToRoute);
  },

  getById: async (id: string): Promise<Route> => {
    const response = await apiClient.get(`/routes/${id}`);
    return response.data.route;
  },

  create: async (input: CreateRouteInput): Promise<Route> => {
    const response = await apiClient.post('/routes', input);
    return response.data.route;
  },

  update: async (id: string, input: UpdateRouteInput): Promise<Route> => {
    const response = await apiClient.put(`/routes/${id}`, input);
    return response.data.route;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/routes/${id}`);
  },
};

