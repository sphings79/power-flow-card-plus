import { BaseConfigEntity, ComboEntity, GridPowerOutage, IndividualDeviceType, SecondaryInfoType, type LovelaceCardConfig } from "./type.js";

export type DisplayZeroLinesMode = "show" | "grey_out" | "transparency" | "hide" | "custom";

interface mainConfigOptions {
  dashboard_link?: string;
  dashboard_link_label?: string;
  second_dashboard_link?: string;
  second_dashboard_link_label?: string;
  kw_decimals: number;
  min_flow_rate: number;
  max_flow_rate: number;
  w_decimals: number;
  watt_threshold: number;
  clickable_entities: boolean;
  max_expected_power: number;
  min_expected_power: number;
  use_new_flow_rate_model?: boolean;
  full_size?: boolean;
  style_ha_card?: any;
  style_card_content?: any;
  disable_dots?: boolean;
  no_labels?: boolean;
  display_zero_lines?: {
    mode?: DisplayZeroLinesMode;
    transparency?: number;
    grey_color?: string | number[];
  };
  /**
   * Visual style of the card.
   * - `classic` (default): outlined circles, the original look.
   * - `mushroom`: filled shapes, Mushroom typography, softer flow lines
   *   and a chip-styled breakdown list, to blend in with Mushroom cards.
   * - `bubble`: soft filled bubbles, pill-shaped lists and a rounded card, to blend
   *   in with Bubble Card. Follows the `--bubble-*` theme variables when present.
   */
  appearance?: "classic" | "mushroom" | "bubble";
  /**
   * Strength of the coloured circle background in percent (0 = neutral, 100 = solid)
   * for the `mushroom` and `bubble` appearances. Unset keeps the appearance's own
   * default (20 for mushroom, 22 for bubble). A node can override it with its own
   * `circle_tint`. Has no effect on `classic`.
   */
  circle_tint?: number;
  /**
   * Ordering of the individual devices.
   * `true` keeps the original behaviour (highest power first); pass `"name"` or
   * `"name_desc"` to sort alphabetically instead.
   */
  sort_individual_devices?: boolean | "value" | "name" | "name_desc";
  /**
   * Where the individual devices are rendered.
   * - `grid` (default): up to four of them occupy the corner slots of the flow diagram
   * - `right`: none of them get a circle; they are listed in a column to the right
   *   of the diagram instead, which suits setups with many devices
   */
  /**
   * Where the individual devices go.
   * - `grid` (default): up to four occupy the corner slots of the flow diagram
   * - anything else: no circles; they are listed in that zone around the diagram
   */
  individual_position?: "grid" | "top" | "bottom" | "left" | "right";
  /**
   * Keep the width of a side zone free even while it is empty, so the diagram does
   * not jump sideways when devices appear. Only has an effect when something is
   * configured to sit left or right of the diagram, and only on wide cards: on a
   * narrow card the zone drops below the diagram anyway.
   */
  reserve_side_width?: boolean;
  /**
   * Maximum width of the whole card content in pixels, centred in the card.
   * `0` or unset lets the content use the full card width.
   */
  max_width?: number;
  /** Where the list of individual PV sources goes. Defaults to `top`. */
  solar_position?: "top" | "bottom" | "left" | "right";
  /** Where the list of individual batteries goes. Defaults to `bottom`. */
  battery_position?: "top" | "bottom" | "left" | "right";
  /** Where the list of individual charging sources goes. Defaults to `bottom`. */
  charger_position?: "top" | "bottom" | "left" | "right";
  /**
   * Colour each individual device by how much it currently draws: green when
   * low, orange in the middle, red at `individual_color_max` and above.
   */
  color_individual_by_usage?: boolean;
  /**
   * Power in watts at which the usage colouring reaches full red.
   * Defaults to `max_expected_power`.
   */
  individual_color_max?: number;
  /**
   * Colour each battery in the breakdown by its state of charge: green when
   * full, orange around half, red when empty. A colour set on the battery
   * itself takes precedence.
   */
  color_battery_by_soc?: boolean;
  /**
   * Colour a battery's power reading by how hard it is discharging: green when
   * barely, orange in between, red at `battery_discharge_max`. Charging counts
   * as no discharge and stays green.
   */
  color_battery_by_discharge?: boolean;
  /**
   * Discharge in watts counting as full load, used when a battery sets no
   * `discharge_color_max` of its own. Defaults to `max_expected_power`.
   */
  battery_discharge_max?: number;
  /**
   * Colour each PV source by how much it currently produces: red when idle,
   * orange in between, green at its peak. Each source is measured against its
   * own `color_max`, so arrays of different sizes stay comparable.
   */
  color_solar_by_output?: boolean;
  /**
   * Output in watts at which a PV source counts as producing fully, used when a
   * source sets no `color_max` of its own. Defaults to `max_expected_power`.
   */
  solar_color_max?: number;
  /**
   * Period the energy values cover.
   *
   * Calendar based: `week` starts on Monday, `month` on the first, `year` on
   * 1 January — each running up to now. `yesterday` is the full previous day.
   *
   * Rolling: `last_7_days`, `last_30_days` and `last_365_days` count whole days
   * back from today, today included.
   */
  energy_period?: "today" | "yesterday" | "week" | "month" | "year" | "last_7_days" | "last_30_days" | "last_365_days";
  /**
   * Show the Watt / kWh switch in the card header. Defaults to `true` as soon as
   * at least one energy entity is configured.
   */
  energy_toggle?: boolean;
  /**
   * Show a day / week / month / year bar with previous / next arrows next to the
   * Watt / kWh switch, like the Home Assistant energy dashboard. Only visible in
   * kWh mode; `energy_period` is the period it starts on. Off by default.
   */
  energy_period_picker?: boolean;
  /** Start the card in energy mode rather than power mode. */
  energy_default?: boolean;
  /**
   * Energy at or above which values are shown in MWh instead of kWh.
   * Defaults to 1000, the natural unit boundary. Lower it if the layout gets
   * tight before then; 0 disables the switch entirely.
   */
  kwh_threshold?: number;
  /** Decimals used once a value is displayed in MWh. Defaults to 2. */
  mwh_decimals?: number;
  allow_layout_break?: boolean;
  /**
   * Maximum number of individual devices rendered in the four corner slots of the flow diagram.
   * Any additional individual devices are rendered in the "extra devices" list below the diagram.
   * Defaults to 4.
   */
  max_individual_in_grid?: number;
}

export interface PowerFlowCardPlusConfig extends LovelaceCardConfig, mainConfigOptions {
  entities: ConfigEntities;
}

export type IndividualField = IndividualDeviceType[];

/**
 * A single physical battery that is aggregated into the main battery node and
 * additionally rendered as a docked item below the flow diagram.
 */
export interface BatteryUnit {
  entity: string;
  /**
   * Discharge in watts at which this battery counts as fully loaded. Lets a small
   * battery be judged against its own maximum rather than a shared number.
   * Falls back to `battery_discharge_max`.
   */
  discharge_color_max?: number;
  /** Cumulative kWh entity for energy charged into this battery. */
  energy_charged_entity?: string;
  /** Cumulative kWh entity for energy discharged from this battery. */
  energy_discharged_entity?: string;
  /** Read those entities' states as-is instead of deriving period totals. */
  energy_from_state?: boolean;
  name?: string;
  icon?: string;
  color?: string;
  state_of_charge?: string;
  state_of_charge_unit?: string;
  state_of_charge_unit_white_space?: boolean;
  state_of_charge_decimals?: number;
  invert_state?: boolean;
}

interface Battery extends BaseConfigEntity {
  /** Cumulative kWh entity for energy charged into the battery. */
  energy_charged_entity?: string;
  /** Cumulative kWh entity for energy discharged from the battery. */
  energy_discharged_entity?: string;
  /** Read those entities' states as-is instead of deriving period totals. */
  energy_from_state?: boolean;
  state_of_charge?: string;
  state_of_charge_unit?: string;
  state_of_charge_unit_white_space?: boolean;
  state_of_charge_decimals?: number;
  show_state_of_charge?: boolean;
  color_state_of_charge_value?: "no_color" | "color_dynamically" | "production" | "consumption";
  color_circle: "color_dynamically" | "production" | "consumption";
  color_value?: boolean;
  color?: ComboEntity;
  /**
   * List of individual batteries. Their power is summed into the main battery node
   * (when `entity` is omitted). Each battery is also shown as a docked item below the
   * diagram. When `state_of_charge` is omitted on the main battery, the aggregate
   * state of charge is the average of the batteries' individual states of charge.
   */
  batteries?: BatteryUnit[];
}

interface Grid extends BaseConfigEntity {
  /** Cumulative kWh entity for energy drawn from the grid. */
  energy_consumed_entity?: string;
  /** Cumulative kWh entity for energy fed back into the grid. */
  energy_returned_entity?: string;
  /** Read those entities' states as-is instead of deriving period totals. */
  energy_from_state?: boolean;
  power_outage: GridPowerOutage;
  secondary_info?: SecondaryInfoType;
  color_circle: "color_dynamically" | "production" | "consumption";
  color_value?: boolean;
  color?: ComboEntity;
}

/**
 * A single PV source that is aggregated into the main solar node and additionally
 * rendered as a docked item below the flow diagram.
 */
export interface SolarSource {
  entity: string;
  name?: string;
  icon?: string;
  color?: string;
  invert_state?: boolean;
  /** Cumulative kWh entity; the card derives the period total from its statistics. */
  energy_entity?: string;
  /** Read the entity's state as-is instead of deriving a period total from it. */
  energy_from_state?: boolean;
  /**
   * Output in watts at which this array counts as producing fully — its peak
   * power. Used by `color_solar_by_output`, so each array is judged against its
   * own size rather than a shared number. Falls back to `solar_color_max`.
   */
  color_max?: number;
}

interface Solar extends Omit<BaseConfigEntity, "entity"> {
  entity?: string;
  /** Cumulative kWh entity; the card derives the period total from its statistics. */
  energy_entity?: string;
  /** Read the entity's state as-is instead of deriving a period total from it. */
  energy_from_state?: boolean;
  color?: any;
  color_icon?: boolean;
  color_value?: boolean;
  color_label?: boolean;
  secondary_info?: SecondaryInfoType & {
    sum_total?: boolean;
  };
  display_zero?: boolean;
  display_zero_state?: boolean;
  /**
   * List of individual PV sources. Their power is summed into the main solar node
   * (when `entity` is omitted). Each source is also shown as a docked item below the diagram.
   */
  sources?: SolarSource[];
}

/**
 * A single external charging source (V2L, generator, shore power, …) that is
 * aggregated into the charger node and additionally rendered as a docked item
 * below the flow diagram.
 */
export interface ChargerSource {
  entity: string;
  name?: string;
  icon?: string;
  color?: string;
  invert_state?: boolean;
  /** Cumulative kWh entity; the card derives the period total from its statistics. */
  energy_entity?: string;
  /** Read the entity's state as-is instead of deriving a period total from it. */
  energy_from_state?: boolean;
}

/**
 * An external source that charges the battery directly, bypassing grid and solar
 * (for example V2L from a car, or a generator).
 *
 * It is rendered as its own node underneath the grid, with a single one-way flow
 * line into the battery. Its power deliberately does not take part in the
 * grid/solar/home distribution maths — the battery entity already reports the
 * resulting charge, so counting it again would double up the numbers.
 */
interface Charger extends Omit<BaseConfigEntity, "entity"> {
  entity?: string;
  /** Cumulative kWh entity; the card derives the period total from its statistics. */
  energy_entity?: string;
  /** Read the entity's state as-is instead of deriving a period total from it. */
  energy_from_state?: boolean;
  color?: string;
  color_icon?: boolean;
  color_value?: boolean;
  color_label?: boolean;
  display_zero?: boolean;
  display_zero_state?: boolean;
  display_zero_tolerance?: number;
  secondary_info?: SecondaryInfoType;
  /**
   * List of individual charging sources. Their power is summed into the charger
   * node (when `entity` is omitted). Each source is also shown as a docked item
   * below the diagram.
   */
  sources?: ChargerSource[];
  /**
   * Whether to list the individual sources below the diagram. Defaults to `true`
   * for more than one source and `false` for a single one, where the list would
   * only repeat what the node already shows.
   */
  show_breakdown?: boolean;
}

interface Home extends BaseConfigEntity {
  entity: string;
  /** Cumulative kWh entity; the card derives the period total from its statistics. */
  energy_entity?: string;
  /** Read the entity's state as-is instead of deriving a period total from it. */
  energy_from_state?: boolean;
  override_state?: boolean;
  color_icon?: boolean | "solar" | "grid" | "battery";
  color_value?: boolean | "solar" | "grid" | "battery";
  subtract_individual?: boolean;
  secondary_info?: SecondaryInfoType;
  circle_animation?: boolean;
  hide?: boolean;
}

interface FossilFuelPercentage extends BaseConfigEntity {
  entity: string;
  color?: string;
  state_type?: "percentage" | "power";
  color_icon?: boolean;
  display_zero?: boolean;
  display_zero_state?: boolean;
  display_zero_tolerance?: number;
  color_value?: boolean;
  color_label?: boolean;
  unit_white_space?: boolean;
  calculate_flow_rate?: boolean | number;
  secondary_info: SecondaryInfoType;
}

export type ConfigEntities = {
  battery?: Battery;
  grid?: Grid;
  solar?: Solar;
  home?: Home;
  fossil_fuel_percentage?: FossilFuelPercentage;
  individual?: IndividualField;
  charger?: Charger;
};

export type ConfigEntity = Battery | Grid | Solar | Home | FossilFuelPercentage | IndividualDeviceType | Charger;
