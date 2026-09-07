/**
 * Spendy Daily Commuter & Boda-Boda Fuel Meter Engine
 * Models daily transit burn rate in Kampala & East African cities.
 */

export type TransitMode = 'boda' | 'matatu' | 'car_fuel' | 'walking';

export interface CommuteRoute {
  id: string;
  name: string;
  oneWayDistanceKm: number;
  bodaFareOneWay: number;
  matatuFareOneWay: number;
  carFuelEstimateOneWay: number;
}

export interface CommuteCalculation {
  dailyCost: number;
  monthlyCost: number;
  selectedMode: TransitMode;
  workingDaysPerMonth: number;
  rainyDaysPerMonth: number;
  rainSurgeMultiplier: number;
  potentialSavingsWithAlternative: {
    alternativeMode: TransitMode;
    monthlySavings: number;
    tip: string;
  };
}

export const KAMPALA_ROUTE_PRESETS: CommuteRoute[] = [
  {
    id: 'route-ntinda-cbd',
    name: 'Ntinda ⇄ Kampala City Centre (CBD)',
    oneWayDistanceKm: 7.5,
    bodaFareOneWay: 7000,
    matatuFareOneWay: 2500,
    carFuelEstimateOneWay: 12000,
  },
  {
    id: 'route-kireka-cbd',
    name: 'Kireka / Bweyogerere ⇄ City Centre',
    oneWayDistanceKm: 11.0,
    bodaFareOneWay: 10000,
    matatuFareOneWay: 3000,
    carFuelEstimateOneWay: 16000,
  },
  {
    id: 'route-kansanga-industrial',
    name: 'Kansanga / Ggaba ⇄ Industrial Area',
    oneWayDistanceKm: 6.0,
    bodaFareOneWay: 6000,
    matatuFareOneWay: 2000,
    carFuelEstimateOneWay: 9500,
  },
  {
    id: 'route-entebbe-kampala',
    name: 'Entebbe ⇄ Kampala Expressway',
    oneWayDistanceKm: 34.0,
    bodaFareOneWay: 35000,
    matatuFareOneWay: 6000,
    carFuelEstimateOneWay: 45000,
  },
  {
    id: 'route-gayaza-wandegeya',
    name: 'Gayaza / Kanyanya ⇄ Wandegeya / Makerere',
    oneWayDistanceKm: 12.0,
    bodaFareOneWay: 11000,
    matatuFareOneWay: 3500,
    carFuelEstimateOneWay: 18000,
  },
];

export function calculateCommute(
  route: CommuteRoute,
  mode: TransitMode,
  workingDays = 22,
  rainyDays = 5,
  rainMultiplier = 1.5
): CommuteCalculation {
  let baseOneWay = 0;
  if (mode === 'boda') baseOneWay = route.bodaFareOneWay;
  else if (mode === 'matatu') baseOneWay = route.matatuFareOneWay;
  else if (mode === 'car_fuel') baseOneWay = route.carFuelEstimateOneWay;
  else baseOneWay = 0;

  const standardDaily = baseOneWay * 2;
  const rainyDaily = standardDaily * rainMultiplier;

  const normalDays = Math.max(0, workingDays - rainyDays);
  const monthlyCost = Math.round(normalDays * standardDaily + rainyDays * rainyDaily);

  // Calculate potential alternative savings
  let altMode: TransitMode = 'matatu';
  let altMonthly = 0;
  let tip = '';

  if (mode === 'boda' || mode === 'car_fuel') {
    altMode = 'matatu';
    const altDaily = route.matatuFareOneWay * 2;
    altMonthly = Math.round(normalDays * altDaily + rainyDays * (altDaily * 1.2));
    const savings = monthlyCost - altMonthly;
    tip = `Taking a Matatu taxi for your morning commute could keep UGX ${savings.toLocaleString()} in your wallet every month.`;
  } else if (mode === 'matatu') {
    altMode = 'boda';
    tip = 'You are already using a cost-effective mass transit option! Plan for rain spikes on Friday evenings.';
  } else {
    tip = 'Zero-emission active commute. Maximum wallet savings!';
  }

  return {
    dailyCost: standardDaily,
    monthlyCost,
    selectedMode: mode,
    workingDaysPerMonth: workingDays,
    rainyDaysPerMonth: rainyDays,
    rainSurgeMultiplier: rainMultiplier,
    potentialSavingsWithAlternative: {
      alternativeMode: altMode,
      monthlySavings: Math.max(0, monthlyCost - altMonthly),
      tip,
    },
  };
}
