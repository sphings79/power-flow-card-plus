import { mdiBatteryHigh, mdiHome, mdiLeaf, mdiTransmissionTower, mdiWeatherSunny } from "@mdi/js";
import { any, assign, boolean, integer, number, object, optional, string, union } from "superstruct";
import memoizeOne from "memoize-one";
import { batterySchema } from "./battery";
import { displayZeroLinesSchema } from "./display-zero-lines";
import { nonFossilSchema } from "./fossil-fuel-percentage";
import { gridSchema } from "./grid";
import { homeSchema } from "./home";
import { individualSchema } from "./individual";
import { solarSchema } from "./solar";

const baseLovelaceCardConfig = object({
  type: string(),
  view_layout: any(),
  layout_options: any(),
  grid_options: any(),
  visibility: any(),
  disabled: optional(boolean()),
});

export const cardConfigStruct = assign(
  baseLovelaceCardConfig,
  object({
    title: optional(string()),
    theme: optional(string()),
    dashboard_link: optional(string()),
    dashboard_link_label: optional(string()),
    second_dashboard_link: optional(string()),
    second_dashboard_link_label: optional(string()),
    inverted_entities: optional(any()),
    w_decimals: optional(integer()),
    kw_decimals: optional(integer()),
    min_flow_rate: optional(number()),
    max_flow_rate: optional(number()),
    min_expected_power: optional(number()),
    max_expected_power: optional(number()),
    watt_threshold: optional(number()),
    clickable_entities: optional(boolean()),
    transparency_zero_lines: optional(number()),
    greyout_zero_lines: optional(boolean()),
    display_zero_lines: optional(any()),
    use_new_flow_rate_model: optional(boolean()),
    full_size: optional(boolean()),
    style_ha_card: optional(any()),
    style_card_content: optional(any()),
    disable_dots: optional(boolean()),
    no_labels: optional(boolean()),
    entities: object({
      battery: optional(any()),
      grid: optional(any()),
      solar: optional(any()),
      home: optional(any()),
      fossil_fuel_percentage: optional(any()),
      individual: optional(any()),
      charger: optional(any()),
    }),
    appearance: optional(string()),
    max_individual_in_grid: optional(number()),
    // Accepts the legacy boolean as well as the sort-mode strings.
    sort_individual_devices: optional(union([boolean(), string()])),
    individual_position: optional(string()),
    circle_tint: optional(number()),
    reserve_side_width: optional(boolean()),
    max_width: optional(number()),
    solar_position: optional(string()),
    battery_position: optional(string()),
    charger_position: optional(string()),
    color_individual_by_usage: optional(boolean()),
    individual_color_max: optional(number()),
    color_battery_by_soc: optional(boolean()),
    color_battery_by_discharge: optional(boolean()),
    battery_discharge_max: optional(number()),
    color_solar_by_output: optional(boolean()),
    solar_color_max: optional(number()),
    energy_period: optional(string()),
    energy_toggle: optional(boolean()),
    energy_period_picker: optional(boolean()),
    energy_default: optional(boolean()),
    kwh_threshold: optional(number()),
    mwh_decimals: optional(integer()),
    allow_layout_break: optional(boolean()),
  })
);

export const generalConfigSchema = [
  {
    name: "title",
    label: "Title",
    selector: { text: {} },
  },
] as const;

export const entitiesSchema = memoizeOne((localize) => [
  {
    name: "entities",
    type: "grid",
    column_min_width: "400px",
    schema: [
      {
        title: localize("editor.grid"),
        name: "grid",
        type: "expandable",
        iconPath: mdiTransmissionTower,
        schema: gridSchema,
      },
      {
        title: localize("editor.solar"),
        name: "solar",
        type: "expandable",
        iconPath: mdiWeatherSunny,
        schema: solarSchema,
      },
      {
        title: localize("editor.battery"),
        name: "battery",
        type: "expandable",
        iconPath: mdiBatteryHigh,
        schema: batterySchema,
      },
      {
        title: localize("editor.fossil_fuel_percentage"),
        name: "fossil_fuel_percentage",
        type: "expandable",
        iconPath: mdiLeaf,
        schema: nonFossilSchema,
      },
      {
        title: localize("editor.home"),
        name: "home",
        type: "expandable",
        iconPath: mdiHome,
        schema: homeSchema,
      },
    ],
  },
]);

export const individualDevicesSchema = memoizeOne((localize) => [
  {
    name: "entities",
    type: "grid",
    column_min_width: "400px",
    schema: [
      {
        title: `${localize("editor.individual")} 1`,
        name: "individual1",
        type: "expandable",
        schema: individualSchema,
      },
      {
        title: `${localize("editor.individual")} 2`,
        name: "individual2",
        type: "expandable",
        schema: individualSchema,
      },
    ],
  },
]);

export const advancedOptionsSchema = memoizeOne((localize, displayZeroLinesMode: string) => [
  {
    type: "grid",
    column_min_width: "200px",
    schema: [
      {
        name: "dashboard_link",
        label: "Dashboard Link",
        selector: { navigation: {} },
      },
      {
        name: "dashboard_link_label",
        label: "Dashboard Link Label",
        selector: { text: {} },
      },
      {
        name: "w_decimals",
        label: "Watt Decimals",
        selector: { number: { mode: "box", min: 0, max: 5, step: 1 } },
      },
      {
        name: "kw_decimals",
        label: "kW Decimals",
        selector: { number: { mode: "box", min: 0, max: 5, step: 1 } },
      },
      {
        name: "max_flow_rate",
        label: "Max Flow Rate (Sec/Dot)",
        selector: { number: { mode: "box", min: 0, max: 1000000, step: 0.01 } },
      },
      {
        name: "min_flow_rate",
        label: "Min Flow Rate (Sec/Dot)",
        selector: { number: { mode: "box", min: 0, max: 1000000, step: 0.01 } },
      },
      {
        name: "max_expected_power",
        label: "Max Expected Power (in Watts)",
        selector: { number: { mode: "box", min: 0, max: 1000000, step: 0.01 } },
      },
      {
        name: "min_expected_power",
        label: "Min Expected Power (in Watts)",
        selector: { number: { mode: "box", min: 0, max: 1000000, step: 0.01 } },
      },
      {
        name: "watt_threshold",
        label: "Watt to Kilowatt Threshold",
        selector: { number: { mode: "box", min: 0, max: 1000000, step: 1 } },
      },

      {
        name: "clickable_entities",
        label: "Clickable Entities",
        default: true,
        selector: { boolean: {} },
      },
      {
        name: "disable_dots",
        label: "Disable Moving Dots",
        selector: { boolean: {} },
      },
      {
        name: "no_labels",
        label: localize("editor.no_labels"),
        selector: { boolean: {} },
      },
      {
        name: "use_new_flow_rate_model",
        label: "New Flow Model?",
        default: true,
        selector: { boolean: {} },
      },
      {
        name: "appearance",
        label: "Appearance",
        selector: {
          select: {
            options: [
              { value: "classic", label: "Classic" },
              { value: "mushroom", label: "Mushroom" },
              { value: "bubble", label: "Bubble" },
            ],
            mode: "dropdown",
          },
        },
      },
      {
        name: "individual_position",
        label: "Individual devices",
        selector: {
          select: {
            options: [
              { value: "grid", label: "As circles in the diagram" },
              { value: "top", label: "As a list above the diagram" },
              { value: "bottom", label: "As a list below the diagram" },
              { value: "left", label: "As a list left of the diagram" },
              { value: "right", label: "As a list right of the diagram" },
            ],
            mode: "dropdown",
          },
        },
      },
      {
        name: "solar_position",
        label: "PV source list",
        selector: {
          select: {
            options: [
              { value: "top", label: "Above the diagram" },
              { value: "bottom", label: "Below the diagram" },
              { value: "left", label: "Left of the diagram" },
              { value: "right", label: "Right of the diagram" },
            ],
            mode: "dropdown",
          },
        },
      },
      {
        name: "battery_position",
        label: "Battery list",
        selector: {
          select: {
            options: [
              { value: "top", label: "Above the diagram" },
              { value: "bottom", label: "Below the diagram" },
              { value: "left", label: "Left of the diagram" },
              { value: "right", label: "Right of the diagram" },
            ],
            mode: "dropdown",
          },
        },
      },
      {
        name: "charger_position",
        label: "Charging source list",
        selector: {
          select: {
            options: [
              { value: "top", label: "Above the diagram" },
              { value: "bottom", label: "Below the diagram" },
              { value: "left", label: "Left of the diagram" },
              { value: "right", label: "Right of the diagram" },
            ],
            mode: "dropdown",
          },
        },
      },
      {
        name: "circle_tint",
        label: "Circle tint in % (mushroom / bubble, empty = default)",
        selector: { number: { mode: "box", min: 0, max: 100, step: 1, unit_of_measurement: "%" } },
      },
      {
        name: "reserve_side_width",
        label: "Reserve the width of the side lists (wide cards only)",
        selector: { boolean: {} },
      },
      {
        name: "max_width",
        label: "Maximum width in px (0 = full card width)",
        selector: { number: { mode: "slider", min: 0, max: 1200, step: 10, unit_of_measurement: "px" } },
      },
      {
        name: "color_individual_by_usage",
        label: "Colour individual devices by usage",
        selector: { boolean: {} },
      },
      {
        name: "individual_color_max",
        label: "Usage colour: watts for full red",
        selector: { number: { mode: "box", min: 1, max: 1000000, step: 1 } },
      },
      {
        name: "energy_period",
        label: "Energy period",
        selector: {
          select: {
            options: [
              { value: "today", label: "Today" },
              { value: "yesterday", label: "Yesterday" },
              { value: "week", label: "This week (from Monday)" },
              { value: "month", label: "This month" },
              { value: "year", label: "This year" },
              { value: "last_7_days", label: "Last 7 days" },
              { value: "last_30_days", label: "Last 30 days" },
              { value: "last_365_days", label: "Last 365 days" },
            ],
            mode: "dropdown",
          },
        },
      },
      {
        name: "energy_period_picker",
        label: "Show the day / week / month / year picker in kWh mode",
        selector: { boolean: {} },
      },
      {
        name: "energy_toggle",
        label: "Show the Watt / kWh switch",
        default: true,
        selector: { boolean: {} },
      },
      {
        name: "energy_default",
        label: "Start in kWh mode",
        selector: { boolean: {} },
      },
      {
        name: "kwh_threshold",
        label: "kWh to MWh Threshold",
        selector: { number: { mode: "box", min: 0, max: 1000000, step: 1 } },
      },
      {
        name: "mwh_decimals",
        label: "MWh Decimals",
        selector: { number: { mode: "box", min: 0, max: 4, step: 1 } },
      },
      {
        name: "color_battery_by_soc",
        label: "Colour batteries by state of charge",
        selector: { boolean: {} },
      },
      {
        name: "color_battery_by_discharge",
        label: "Colour batteries by discharge",
        selector: { boolean: {} },
      },
      {
        name: "battery_discharge_max",
        label: "Discharge colour: watts for full red",
        selector: { number: { mode: "box", min: 1, max: 1000000, step: 10 } },
      },
      {
        name: "color_solar_by_output",
        label: "Colour PV sources by output",
        selector: { boolean: {} },
      },
      {
        name: "solar_color_max",
        label: "PV colour: watts for full green",
        selector: { number: { mode: "box", min: 1, max: 1000000, step: 10 } },
      },
      {
        name: "sort_individual_devices",
        label: "Sort individual devices",
        selector: {
          select: {
            options: [
              { value: "value", label: "By usage (highest first)" },
              { value: "name", label: "By name (A-Z)" },
              { value: "name_desc", label: "By name (Z-A)" },
            ],
            mode: "dropdown",
          },
        },
      },
      {
        name: "allow_layout_break",
        label: "Allow Layout Break",
        selector: { boolean: {} },
      },
    ],
  },
  {
    type: "expandable",
    title: localize("editor.display_zero_lines"),
    schema: [...displayZeroLinesSchema(localize, displayZeroLinesMode)],
  },
]);
