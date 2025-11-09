import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // wipe old rows (optional)
  await prisma.$executeRawUnsafe(`DELETE FROM "routes";`);

  await prisma.routes.createMany({
    data: [
      { 
        vesselId: "V001", 
        name: "Route R001 - Container", 
        totalDistanceNauticalMiles: 6479.48, // ~12000 km converted
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-15"),
        status: "COMPLETED",
        segments: { route_id: "R001", vessel_type: "Container", fuel_type: "HFO", year: 2024, ghg_intensity: 91.0, fuel_consumption: 5000, distance_km: 12000, total_emissions: 4500, is_baseline: true }
      },
      { 
        vesselId: "V002", 
        name: "Route R002 - Bulk Carrier", 
        totalDistanceNauticalMiles: 6207.34, // ~11500 km converted
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-02-14"),
        status: "COMPLETED",
        segments: { route_id: "R002", vessel_type: "BulkCarrier", fuel_type: "LNG", year: 2024, ghg_intensity: 88.0, fuel_consumption: 4800, distance_km: 11500, total_emissions: 4200, is_baseline: false }
      },
      { 
        vesselId: "V003", 
        name: "Route R003 - Tanker", 
        totalDistanceNauticalMiles: 6749.46, // ~12500 km converted
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-03-16"),
        status: "COMPLETED",
        segments: { route_id: "R003", vessel_type: "Tanker", fuel_type: "MGO", year: 2024, ghg_intensity: 93.5, fuel_consumption: 5100, distance_km: 12500, total_emissions: 4700, is_baseline: false }
      },
      { 
        vesselId: "V004", 
        name: "Route R004 - RoRo", 
        totalDistanceNauticalMiles: 6369.33, // ~11800 km converted
        startDate: new Date("2025-01-01"),
        status: "PLANNED",
        segments: { route_id: "R004", vessel_type: "RoRo", fuel_type: "HFO", year: 2025, ghg_intensity: 89.2, fuel_consumption: 4900, distance_km: 11800, total_emissions: 4300, is_baseline: false }
      },
      { 
        vesselId: "V005", 
        name: "Route R005 - Container", 
        totalDistanceNauticalMiles: 6422.08, // ~11900 km converted
        startDate: new Date("2025-02-01"),
        status: "PLANNED",
        segments: { route_id: "R005", vessel_type: "Container", fuel_type: "LNG", year: 2025, ghg_intensity: 90.5, fuel_consumption: 4950, distance_km: 11900, total_emissions: 4400, is_baseline: false }
      }
    ],
    skipDuplicates: true
  });
}

main()
  .then(() => console.log("✅ Seed complete"))
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
