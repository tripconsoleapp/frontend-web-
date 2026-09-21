import { VehicleSelectionItem } from "./listing-draft";

export function totalCapacity(vehicles: VehicleSelectionItem[]) {
  return vehicles.reduce((sum, v) => sum + v.capacity, 0);
}

export function totalPrice(vehicles: VehicleSelectionItem[]) {
  return vehicles.reduce((sum, v) => sum + v.price, 0);
}

export function fitsGroup(vehicles: VehicleSelectionItem[], passengerCount: number) {
  return totalCapacity(vehicles) >= passengerCount;
}

export interface PricingBreakdown {
  baseFare: number;
  driverAllowance: number;
  nightHalt: number;
  tollsAndParking: number;
  total: number;
}

/**
 * Illustrative pricing breakdown, not a real pricing engine — the app has
 * none today. Decomposes the vehicles' own total (never invents a new
 * total) so the numbers shown always sum exactly to what the organizer
 * already saw on the results/combination screens.
 */
export function buildPricingBreakdown(vehicles: VehicleSelectionItem[]): PricingBreakdown {
  const total = totalPrice(vehicles);
  const vehicleCount = Math.max(vehicles.length, 1);
  const hasAllowances = total >= 10000;
  const driverAllowance = hasAllowances ? 500 * vehicleCount : 0;
  const nightHalt = hasAllowances ? 1500 * vehicleCount : 0;
  const tollsAndParking = Math.round(total * 0.08);
  const baseFare = total - driverAllowance - nightHalt - tollsAndParking;
  return { baseFare, driverAllowance, nightHalt, tollsAndParking, total };
}
