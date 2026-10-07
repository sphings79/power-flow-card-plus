import localize from "@/localize/localize";

export function getEntityCombinedSelectionSchema() {
  return {
    type: "expandable",
    title: localize("editor.combined"),
    schema: [
      {
        name: "entity",
        selector: { entity: {} },
      },
    ],
  } as const;
}

export function getEntitySeparatedSelectionSchema() {
  return {
    type: "expandable",
    title: localize("editor.separated"),
    name: "entity",
    schema: [
      {
        name: "consumption",
        label: "Consumption Entity",
        selector: { entity: {} },
      },
      {
        name: "production",
        label: "Production Entity",
        selector: { entity: {} },
      },
    ],
  } as const;
}

export const customColorsSchema = {
  name: "color",
  title: localize("editor.custom_colors"),
  type: "expandable",
  schema: [
    {
      type: "grid",
      column_min_width: "200px",
      schema: [
        {
          name: "consumption",
          label: "Consumption",
          selector: { color_rgb: {} },
        },
        {
          name: "production",
          label: "Production",
          selector: { color_rgb: {} },
        },
      ],
    },
  ],
} as const;

export const actionSchema = [
  {
    name: "tap_action",
    selector: {
      ui_action: {},
    },
  },
  {
    name: "hold_action",
    selector: {
      ui_action: {},
    },
  },
  {
    name: "double_tap_action",
    selector: {
      ui_action: {},
    },
  },
] as const;

export const secondaryInfoSchema = [
  {
    name: "entity",
    selector: { entity: {} },
  },
  {
    name: "template",
    label: "Template (overrides entity, save to update)",
    selector: { template: {} },
  },
  {
    type: "grid",
    column_min_width: "200px",
    schema: [
      { name: "icon", selector: { icon: {} } },
      { name: "unit_of_measurement", label: "Unit of Measurement", selector: { text: {} } },
      { name: "decimals", label: "Decimals", selector: { number: { mode: "box", min: 0, max: 10, step: 1 } } },
      { name: "color_value", label: "Color Value", selector: { boolean: {} } },
      { name: "unit_white_space", label: "Unit White Space", default: true, selector: { boolean: {} } },
      { name: "display_zero", label: "Display Zero", selector: { boolean: {} } },
      { name: "accept_negative", label: "Accept Negative", selector: { boolean: {} } },
      { name: "display_zero_tolerance", label: "Display Zero Tolerance", selector: { number: { mode: "box", min: 0, max: 1000000, step: 0.1 } } },
    ],
  },
  {
    title: localize("editor.action"),
    name: "",
    type: "expandable",
    schema: actionSchema,
  },
] as const;

const batteryOrGridMainConfigSchema = [
  {
    name: "color_icon",
    label: "Color of Icon",
    selector: {
      select: {
        options: [
          { value: "no_color", label: localize("editor.no_color") },
          { value: "color_dynamically", label: localize("editor.color_dynamically") },
          { value: "production", label: localize("editor.production") },
          { value: "consumption", label: localize("editor.consumption") },
        ],
        mode: "dropdown",
      },
    },
  },
  {
    name: "color_circle",
    label: "Color of Circle",
    selector: {
      select: {
        options: [
          { value: "color_dynamically", label: "Color dynamically" },
          { value: "consumption", label: "Consumption" },
          { value: "production", label: "Production" },
        ],
        mode: "dropdown",
      },
    },
  },
  {
    name: "display_zero_tolerance",
    label: "Display Zero Tolerance",
    selector: {
      number: {
        min: 0,
        max: 1000000,
        step: 1,
        mode: "box",
      },
    },
  },
  {
    name: "display_state",
    label: "Display State",
    selector: {
      select: {
        options: [
          { value: "two_way", label: "Two Way" },
          { value: "one_way_no_zero", label: "One Way" },
          { value: "one_way", label: "One Way (Show Zero)" },
        ],
        mode: "dropdown",
      },
    },
  },
] as const;

export function getBaseMainConfigSchema(field?: string) {
  const result: any = {
    type: "grid",
    column_min_width: "200px",
    schema: [
      { name: "name", selector: { text: {} } },
      { name: "icon", selector: { icon: {} } },
      {
        name: "circle_tint",
        label: "Circle tint in % (mushroom / bubble, empty = card default)",
        selector: { number: { mode: "box", min: 0, max: 100, step: 1, unit_of_measurement: "%" } },
      },
    ],
  };
  if (field === "battery" || field === "grid") {
    result.schema.push(...batteryOrGridMainConfigSchema);
  }
  return result;
}

/**
 * Expandable "Energy" block for a node's editor page.
 *
 * The card derives the period total from a cumulative kWh entity's statistics,
 * so these point at lifetime counters. `energy_from_state` switches to reading
 * the entity's state verbatim, for sensors that already cover the period.
 */
export function getEnergySchema(kind: "single" | "grid" | "battery") {
  const entityFields =
    kind === "grid"
      ? [
          { name: "energy_consumed_entity", label: "Energy consumed (kWh)", selector: { entity: {} } },
          { name: "energy_returned_entity", label: "Energy returned (kWh)", selector: { entity: {} } },
        ]
      : kind === "battery"
        ? [
            { name: "energy_charged_entity", label: "Energy charged (kWh)", selector: { entity: {} } },
            { name: "energy_discharged_entity", label: "Energy discharged (kWh)", selector: { entity: {} } },
          ]
        : [{ name: "energy_entity", label: "Energy entity (kWh)", selector: { entity: {} } }];

  return {
    title: localize("editor.energy"),
    name: "",
    type: "expandable",
    schema: [
      ...entityFields,
      {
        name: "energy_from_state",
        label: "Read state as-is (sensor already covers the period)",
        selector: { boolean: {} },
      },
    ],
  };
}
