export type ComputeEntityStateWatts = (entityId: string) => number;
export type ComputeEntityState = (entityId: string | undefined) => number | null;

type ToleranceConfig = {
  grid?: { display_zero_tolerance?: number };
  battery?: { display_zero_tolerance?: number };
  solar?: { display_zero_tolerance?: number };
  fossil_fuel_percentage?: { entity?: string };
};

type Truthy = boolean | number | string;

type PowerGrid = {
  icon: string;
  powerOutage: {
    isOutage: boolean;
    entityGenerator?: string;
    icon: string;
  };
  state: {
    fromGrid: number | null;
    toGrid: number | null;
    toBattery: number | null;
    toHome: number | null;
  };
};

type PowerSolar = {
  has: Truthy;
  state: {
    total: number | null;
    toHome: number | null;
    toBattery: number | null;
    toGrid: number | null;
  };
};

type PowerBattery = {
  has: Truthy;
  state: {
    fromBattery: number | null;
    toBattery: number | null;
    toGrid: number | null;
    toHome: number | null;
  };
};

type NonFossil = {
  has: Truthy;
  hasPercentage: boolean;
  state: {
    power: number | null;
  };
};

export function computePowerDistributionAfterSolarAndBattery(params: {
  entities: ToleranceConfig;
  grid: PowerGrid;
  solar: PowerSolar;
  battery: PowerBattery;
  nonFossil: NonFossil;
  getEntityStateWatts: ComputeEntityStateWatts;
  getEntityState: ComputeEntityState;
  /**
   * Power an external charging source (V2L, generator, ...) pushes straight into the
   * battery. It is part of the battery readings but never passes the house, so it must
   * neither be taken away from what solar and grid supply nor count as house supply.
   */
  chargerToBattery?: number | null;
}): void {
  const { entities, grid, solar, battery, nonFossil, getEntityStateWatts, getEntityState } = params;

  // The battery readings are what flows into and out of the batteries as a whole, an
  // external source (V2L, generator) included. That part never passes the house, so it
  // is taken off first. What it covers of the charge is not asked of solar and grid, and
  // what it delivers beyond the charge has left the batteries again towards the house:
  // with 2471 W from V2L and a net charge of 1713 W, 758 W are being drawn from them.
  // Without this the home consumption collapses to zero while V2L is charging.
  const external = Math.max(0, params.chargerToBattery ?? 0);
  const chargeIn = battery.state.toBattery;
  const coveredByExternal = Math.min(external, chargeIn ?? 0);
  const batteryChargeFromHouse = chargeIn === null ? null : chargeIn - coveredByExternal;
  const batteryDischargeToHouse = (battery.state.fromBattery ?? 0) + (external - coveredByExternal);

  if (solar.has) {
    solar.state.toHome = (solar.state.total ?? 0) - (grid.state.toGrid ?? 0) - (batteryChargeFromHouse ?? 0);
  }

  const largestGridBatteryTolerance = Math.max(entities.grid?.display_zero_tolerance ?? 0, entities.battery?.display_zero_tolerance ?? 0);

  if (solar.state.toHome !== null && solar.state.toHome < 0) {
    if (battery.has) {
      grid.state.toBattery = Math.abs(solar.state.toHome);
      if (grid.state.toBattery > (grid.state.fromGrid ?? 0)) {
        battery.state.toGrid = Math.min(grid.state.toBattery - (grid.state.fromGrid ?? 0), 0);
        grid.state.toBattery = grid.state.fromGrid;
      }
    }

    solar.state.toHome = 0;
  } else if (batteryChargeFromHouse !== null && batteryChargeFromHouse > 0) {
    solar.state.toBattery = (solar.state.total ?? 0) - (solar.state.toHome || 0) - (grid.state.toGrid || 0);
    grid.state.toBattery = batteryChargeFromHouse - solar.state.toBattery;
  } else {
    grid.state.toBattery = 0;
  }

  grid.state.toBattery = (grid.state.toBattery ?? 0) > largestGridBatteryTolerance ? grid.state.toBattery : 0;

  if (battery.has) {
    if (solar.has) {
      if (!battery.state.toGrid) {
        battery.state.toGrid = Math.max(
          0,
          (grid.state.toGrid || 0) - (solar.state.total || 0) - (batteryChargeFromHouse || 0) - (grid.state.toBattery || 0)
        );
      }

      solar.state.toBattery = (batteryChargeFromHouse ?? 0) - (grid.state.toBattery || 0);
      if (entities.solar?.display_zero_tolerance) {
        if (entities.solar.display_zero_tolerance >= (solar.state.total || 0)) solar.state.toBattery = 0;
      }
    } else {
      battery.state.toGrid = grid.state.toGrid || 0;
    }

    battery.state.toGrid = (battery.state.toGrid || 0) > largestGridBatteryTolerance ? battery.state.toGrid || 0 : 0;
    battery.state.toHome = batteryDischargeToHouse - (battery.state.toGrid ?? 0);
  }

  grid.state.toHome = Math.max((grid.state.fromGrid ?? 0) - (grid.state.toBattery ?? 0), 0);

  if (solar.has && grid.state.toGrid) solar.state.toGrid = grid.state.toGrid - (battery.state.toGrid ?? 0);

  if (grid.powerOutage.isOutage) {
    grid.state.fromGrid = grid.powerOutage.entityGenerator ? Math.max(getEntityStateWatts(grid.powerOutage.entityGenerator), 0) : 0;
    grid.state.toHome = Math.max((grid.state.fromGrid ?? 0) - (grid.state.toBattery ?? 0), 0);
    grid.state.toGrid = 0;
    battery.state.toGrid = 0;
    solar.state.toGrid = 0;
    grid.icon = grid.powerOutage.icon;
    nonFossil.has = false;
    nonFossil.hasPercentage = false;
  }

  if (nonFossil.has) {
    const nonFossilFuelDecimal = 1 - (getEntityState(entities.fossil_fuel_percentage?.entity) ?? 0) / 100;
    nonFossil.state.power = (grid.state.toHome ?? 0) * nonFossilFuelDecimal;
  }
}
