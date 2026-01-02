import { RideRepository } from '../repositories/RideRepository';

export interface RideMetrics {
  id: number;
  createdAt: Date;
  earning: number;
  distanceKm: number;
  durationMinutes: number;
  totalCosts: number;
  netProfit: number;
  profitPerHour: number | null;
  profitPerKm: number | null;
}

export interface AggregatedMetrics {
  label: string;
  totalEarning: number;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  totalCosts: number;
  netProfit: number;
  profitPerHour: number | null;
  profitPerKm: number | null;
}

export class RideService {
  private rideRepository: RideRepository;

  constructor() {
    this.rideRepository = new RideRepository();
  }

  async createManualRide(params: {
    workDayId?: number;
    earning: number;
    distanceKm: number;
    durationMinutes: number;
    fuelCost?: number;
    feeCost?: number;
    maintenanceCost?: number;
    otherCost?: number;
  }): Promise<RideMetrics> {
    const ride = await this.rideRepository.createRide(params);
    const totalCosts =
      (ride.fuelCost ?? 0) +
      (ride.feeCost ?? 0) +
      (ride.maintenanceCost ?? 0) +
      (ride.otherCost ?? 0);
    const netProfit = ride.earning - totalCosts;
    const hours = ride.durationMinutes > 0 ? ride.durationMinutes / 60 : 0;
    const profitPerHour = hours > 0 ? netProfit / hours : null;
    const profitPerKm = ride.distanceKm > 0 ? netProfit / ride.distanceKm : null;
    return {
      id: ride.id,
      createdAt: ride.createdAt,
      earning: ride.earning,
      distanceKm: ride.distanceKm,
      durationMinutes: ride.durationMinutes,
      totalCosts,
      netProfit,
      profitPerHour,
      profitPerKm
    };
  }

  async getDailyComparisons(): Promise<AggregatedMetrics[]> {
    const rides = await this.rideRepository.listRides();
    const groups: Record<string, AggregatedMetrics> = {};
    for (const r of rides) {
      const key = r.createdAt.toISOString().slice(0, 10);
      if (!groups[key]) {
        groups[key] = {
          label: key,
          totalEarning: 0,
          totalDistanceKm: 0,
          totalDurationMinutes: 0,
          totalCosts: 0,
          netProfit: 0,
          profitPerHour: null,
          profitPerKm: null
        };
      }
      const totalCosts =
        (r.fuelCost ?? 0) +
        (r.feeCost ?? 0) +
        (r.maintenanceCost ?? 0) +
        (r.otherCost ?? 0);
      groups[key].totalEarning += r.earning;
      groups[key].totalDistanceKm += r.distanceKm;
      groups[key].totalDurationMinutes += r.durationMinutes;
      groups[key].totalCosts += totalCosts;
      groups[key].netProfit = groups[key].totalEarning - groups[key].totalCosts;
    }
    Object.values(groups).forEach(g => {
      const hours = g.totalDurationMinutes > 0 ? g.totalDurationMinutes / 60 : 0;
      g.profitPerHour = hours > 0 ? g.netProfit / hours : null;
      g.profitPerKm = g.totalDistanceKm > 0 ? g.netProfit / g.totalDistanceKm : null;
    });
    return Object.values(groups).sort((a, b) => (a.label < b.label ? 1 : -1));
  }

  async getWeeklyComparisons(): Promise<AggregatedMetrics[]> {
    const rides = await this.rideRepository.listRides();
    const weekKey = (d: Date) => {
      const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
      const day = date.getUTCDay();
      const diff = (day === 0 ? -6 : 1) - day;
      const monday = new Date(date);
      monday.setUTCDate(date.getUTCDate() + diff);
      return monday.toISOString().slice(0, 10);
    };
    const groups: Record<string, AggregatedMetrics> = {};
    for (const r of rides) {
      const key = weekKey(r.createdAt);
      if (!groups[key]) {
        groups[key] = {
          label: key,
          totalEarning: 0,
          totalDistanceKm: 0,
          totalDurationMinutes: 0,
          totalCosts: 0,
          netProfit: 0,
          profitPerHour: null,
          profitPerKm: null
        };
      }
      const totalCosts =
        (r.fuelCost ?? 0) +
        (r.feeCost ?? 0) +
        (r.maintenanceCost ?? 0) +
        (r.otherCost ?? 0);
      groups[key].totalEarning += r.earning;
      groups[key].totalDistanceKm += r.distanceKm;
      groups[key].totalDurationMinutes += r.durationMinutes;
      groups[key].totalCosts += totalCosts;
      groups[key].netProfit = groups[key].totalEarning - groups[key].totalCosts;
    }
    Object.values(groups).forEach(g => {
      const hours = g.totalDurationMinutes > 0 ? g.totalDurationMinutes / 60 : 0;
      g.profitPerHour = hours > 0 ? g.netProfit / hours : null;
      g.profitPerKm = g.totalDistanceKm > 0 ? g.netProfit / g.totalDistanceKm : null;
    });
    return Object.values(groups).sort((a, b) => (a.label < b.label ? 1 : -1));
  }
}
