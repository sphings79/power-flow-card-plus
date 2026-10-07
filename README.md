<div align="center">

<img src="docs/images/banner.svg" alt="Power Flow Card Plus Mushroom — Home Assistant energy flow card with multiple batteries, multiple PV sources and Mushroom styling" width="100%">

# Power Flow Card Plus Mushroom

**The power flow card, with more than one battery, more than one PV string and more than four devices.**

[![HACS Custom Repository](https://img.shields.io/badge/HACS-Custom%20Repository-41BDF5.svg?style=flat-square)](https://hacs.xyz)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/sphings79/power-flow-card-plus-mushroom?style=flat-square)](https://github.com/sphings79/power-flow-card-plus-mushroom/releases/latest)
[![GitHub total downloads](https://img.shields.io/github/downloads/sphings79/power-flow-card-plus-mushroom/total?style=flat-square)](https://github.com/sphings79/power-flow-card-plus-mushroom/releases)
[![commit_activity](https://img.shields.io/github/commit-activity/y/sphings79/power-flow-card-plus-mushroom?color=brightgreen&label=Commits&style=flat-square)](https://github.com/sphings79/power-flow-card-plus-mushroom/commits/main)

**English** · [Deutsch](README.de.md)

<img src="docs/images/card-preview.svg" alt="The card with three PV sources and two batteries: aggregated solar and battery nodes with animated flows, and a docked breakdown listing every source and battery underneath" width="52%">

<sub>Illustration of the card's layout — not a photograph of a running instance.</sub>

</div>

> [!NOTE]
> **This is a fork.** It builds on [flixlix/power-flow-card-plus](https://github.com/flixlix/power-flow-card-plus) by [@flixlix](https://github.com/flixlix), who wrote the original card and deserves the credit for it. This fork adds multiple batteries, multiple PV sources, unlimited individual devices and a Mushroom-style appearance.
>
> It is **not** part of the HACS default store — install it as a [custom repository](#hacs-custom-repository). Please report problems with the fork in [this repository's issue tracker](https://github.com/sphings79/power-flow-card-plus-mushroom/issues) rather than upstream.
>
> If the original card is useful to you, consider supporting its author on [ko-fi](https://ko-fi.com/flixlix).

## Additional Features / Enhancements

- UI Editor!!! 🥳
- Multiple Language support (🇺🇸, 🇩🇪, 🇵🇹, 🇪🇸, 🇧🇷, 🇳🇱, 🇮🇹, 🇫🇷, 🇷🇺, 🇫🇮, 🇵🇱, 🇩🇰, 🇸🇰, 🇨🇿)
- Bidirectional Individual Entities ↕️
- Secondary Information for all circles ℹ️
- Display Grid Power Outage ⚡️
- Template functionality 📙

<details>
<summary>... and More:</summary>

- Option for card full size
- Add Grid Tolerance for small values, to not display the battery correcting grid values
- New and improved Flow Rate Model
- Choose wether or not to color icons, text, etc.
- Display Individual power entities
- Customize Individual entities's label, icon and color
- Configure wether to hide Individual Entity when state is 0 or unavailable
- Clickable entities (including home)
- Fixed crooked lines
- Have curved lines connect to the Circles
- Keep color of battery to grid line, even when not returning
- Display Low Carbon Energy from the grid
- Customize Low Carbon Energy label, icon, circle color, icon color and state type
- Customize Battery, Solar and Home's color, icon, color of icon and label

</details>

## Fork additions: Multiple Batteries, Multiple PV, unlimited Individual devices & external charging

> [!IMPORTANT]
> **This fork uses its own card type so it can run side by side with the original card.**
> - Card type in YAML: **`custom:power-flow-card-plus-mushroom`**
> - JavaScript resource file: **`power-flow-card-plus-mushroom.js`**
> - Name in the card picker: **“Power Flow Card Plus (Mushroom)”**
>
> Every custom element in this bundle is uniquely named, so installing both the original `power-flow-card-plus` and this fork at the same time does not clash. Add the fork as a separate dashboard resource pointing to `power-flow-card-plus-mushroom.js`.

> [!NOTE]
> The `sources`, `batteries` and `max_individual_in_grid` options are **additions of this fork** (`sphings79/power-flow-card-plus-mushroom`) and are not part of the upstream card. Everything else works exactly like upstream; an upstream configuration keeps working once you switch its `type:` to `custom:power-flow-card-plus-mushroom`.

This fork lets you drive the main **Solar** and **Battery** nodes from *several* entities and lift the four-device limit on **Individual** entities. The main nodes keep the familiar aggregated look and animated flows; each underlying device is additionally listed in a compact, docked breakdown directly below the flow diagram.

### Multiple PV sources (`solar.sources`)

Provide a list of PV sources instead of (or in addition to) a single `solar.entity`. Their power is **summed** into the main solar node, and each source is listed below the diagram. If you omit `solar.entity`, the aggregate is computed automatically from the sources.

```yaml
type: custom:power-flow-card-plus-mushroom
entities:
  solar:
    # entity: sensor.pv_total   # optional – omit to auto-sum the sources
    sources:
      - entity: sensor.pv_roof_south
        name: Roof South
      - entity: sensor.pv_roof_east
        name: Roof East
      - entity: sensor.pv_garage
        name: Garage
```

Each source accepts: `entity` (required), `name`, `icon`, `color`, `invert_state`.

### Multiple batteries (`battery.batteries`)

Provide a list of batteries. Their power is **summed** into the main battery node. If you don't set an aggregate `battery.state_of_charge`, the node's state of charge is the **average** of the individual batteries' states of charge (summing percentages would be wrong). Each battery is listed below the diagram with its own power and state of charge.

```yaml
type: custom:power-flow-card-plus-mushroom
entities:
  battery:
    # entity: sensor.battery_total_power        # optional – omit to auto-sum
    # state_of_charge: sensor.battery_total_soc # optional – omit to average
    color_circle: color_dynamically
    batteries:
      - entity: sensor.battery_1_power
        state_of_charge: sensor.battery_1_soc
        name: Battery 1
      - entity: sensor.battery_2_power
        state_of_charge: sensor.battery_2_soc
        name: Battery 2
```

Each battery accepts: `entity` (required), `state_of_charge`, `name`, `icon`, `color`, `state_of_charge_unit`, `state_of_charge_decimals`, `invert_state`.

### More than 4 Individual devices

The `individual` list is unlimited. The first four devices occupy the four corner slots of the flow diagram (as before); any **additional** devices are rendered in the docked list below the diagram. Use `max_individual_in_grid` (0–4, default 4) to control how many go into the corners — set it to `0` to move *all* individual devices into the list.

```yaml
type: custom:power-flow-card-plus-mushroom
max_individual_in_grid: 4   # optional, 0..4 (default 4)
entities:
  individual:
    - { entity: sensor.car, name: Car }
    - { entity: sensor.washer, name: Washing Machine }
    - { entity: sensor.dishwasher, name: Dishwasher }
    - { entity: sensor.oven, name: Oven }
    - { entity: sensor.server, name: Server }     # 5th+ -> shown in the list
    - { entity: sensor.pool, name: Pool Pump }
```

> [!TIP]
> All sub-entities of one node should share the same unit (e.g. all `W` or all `kW`); the aggregate uses the first entity's unit. The docked list items are clickable (more-info) when `clickable_entities` is enabled.

### External battery charging (`charger`)

Some setups charge the battery from a source that is neither the grid nor the PV
array — a car via V2L, a generator, shore power. The `charger` node makes that
visible: it sits **below the grid** and feeds the battery through its own one-way
flow line.

```yaml
type: custom:power-flow-card-plus-mushroom
entities:
  battery:
    entity: sensor.battery_power
  charger:
    name: V2L / Generator
    icon: mdi:ev-station
    sources:
      - entity: sensor.v2l_power
        name: V2L
        icon: mdi:car-electric
      - entity: sensor.generator_power
        name: Generator
        icon: mdi:engine
```

Like `solar.sources` and `battery.batteries`, the `sources` list is summed into
the node and each entry also appears in the docked breakdown below the diagram.
A single `entity` works too, if you already aggregate the sources elsewhere.

| Option                   | Type      | Default        | Description                                                                 |
| ------------------------ | --------- | -------------- | --------------------------------------------------------------------------- |
| `sources`                | `list`    | —              | Individual charging sources, summed into the node.                          |
| `entity`                 | `string`  | —              | Single aggregate entity. Optional when `sources` is set.                    |
| `name`                   | `string`  | `Charging source` | Label below the circle.                                                  |
| `icon`                   | `string`  | `mdi:ev-station` | Icon inside the circle.                                                   |
| `display_zero`           | `boolean` | `true`         | Keep the node visible when nothing is charging.                             |
| `display_zero_tolerance` | `number`  | `0`            | Ignore readings at or below this many watts, to suppress sensor noise.      |
| `invert_state`           | `boolean` | `false`        | For sources that report delivered power as negative.                        |

> [!NOTE]
> The flow is one-way and deliberately kept out of the grid/solar/home
> distribution maths. Your battery entity already reports the resulting charge,
> so feeding this power into the distribution as well would count it twice. The
> node needs a configured battery — on its own it would have nowhere to point.

### Configuring all of this in the UI

The lists above (`solar.sources`, `battery.batteries`, `charger.sources`) used to
be YAML-only. They now have proper fields in the visual editor: open the Solar,
Battery or Charging-source page and use **Add** to append an entry, with controls
to reorder and remove. Editing the rest of a page no longer discards a list that
was set up in YAML.

### Individual devices as a list (`individual_position`)

With more than a handful of individual devices the four corner slots stop being
useful. Set `individual_position: right` and they lose their circles entirely,
appearing instead as a list beside the diagram — the same style as the battery
breakdown below it.

```yaml
type: custom:power-flow-card-plus-mushroom
individual_position: right          # grid (default) | right
sort_individual_devices: name_desc  # value (default) | name | name_desc
entities:
  individual:
    - entity: sensor.washing_machine
      name: Washing machine
      icon: mdi:washing-machine
```

`sort_individual_devices` also accepts the historical `true`, which is the same
as `value` — highest usage first. On narrow cards the list moves below the
diagram instead of squeezing it.

Devices can additionally be tinted by how much they currently draw — green when
low, orange in the middle, red at the top of the scale:

```yaml
color_individual_by_usage: true
individual_color_max: 3000   # watts for full red; defaults to max_expected_power
```

The batteries in the breakdown can be tinted by their state of charge — green
when full, orange around half, red when empty:

```yaml
color_battery_by_soc: true
```

A battery's power reading can be coloured by how hard it is discharging — green
when barely, red at full load. Each battery is judged against its own maximum:

```yaml
color_battery_by_discharge: true
battery_discharge_max: 8000        # fallback for batteries without their own
entities:
  battery:
    batteries:
      - entity: sensor.battery_a_power
        discharge_color_max: 8000
      - entity: sensor.battery_b_power
        discharge_color_max: 2500
```

Discharge is read as a **negative** reading, the same way the row displays it;
charging counts as no discharge and stays green. The two switches are
independent: `color_battery_by_soc` tints the icon and the accent bar,
`color_battery_by_discharge` the power value.

A colour set on the battery itself always wins over either tint.

The docked breakdown below the diagram lays its entries out two per row, so four
batteries form a 2x2 block rather than one tall column.

### Energy mode (`kWh`)

The card can show energy instead of power. A switch in the header flips between
the two, and the batteries and individual devices show their energy permanently
in the lists — there is room for it there.

```yaml
type: custom:power-flow-card-plus-mushroom
energy_period: today   # yesterday | week | month | year | last_7_days | last_30_days | last_365_days
energy_toggle: true    # show the W / kWh switch (default: true once energy is configured)
energy_default: false  # start in kWh mode
energy_period_picker: false  # day / week / month / year bar with arrows, in kWh mode (default: off)
entities:
  grid:
    entity: sensor.grid_power
    energy_consumed_entity: sensor.grid_import          # cumulative kWh
    energy_returned_entity: sensor.grid_export
  solar:
    entity: sensor.solar_power
    energy_entity: sensor.solar_production
  battery:
    entity: sensor.battery_power
    energy_charged_entity: sensor.battery_charged_total
    energy_discharged_entity: sensor.battery_discharged_total
    batteries:
      - entity: sensor.battery_a_power
        energy_charged_entity: sensor.battery_a_charged_total
        energy_discharged_entity: sensor.battery_a_discharged_total
  individual:
    - entity: sensor.washing_machine_power
      energy_entity: sensor.washing_machine_energy
```

With `energy_period_picker: true` the card shows a day / week / month / year bar
with previous / next arrows and a "Today" button next to the W / kWh switch, like
the Home Assistant energy dashboard. The bar appears in kWh mode only (its space
stays reserved in W mode, so the diagram does not jump), starts on `energy_period`
and follows the first weekday of your Home Assistant profile.

**Point these at cumulative kWh sensors**, not at daily ones. The card asks Home
Assistant's statistics for the difference over the chosen period, so one lifetime
counter serves every period. If a sensor already represents exactly the period you
want, add `energy_from_state: true` next to it and the card reads its state as-is
instead.

Periods are calendar based — `week` starts on Monday, `month` on the first,
`year` on 1 January, each running up to now. The `last_*` variants are rolling
windows counting whole days back from today, today included.

In the lists the batteries show both directions, with an arrow down for energy
charged and an arrow up for energy discharged.

Every one of these entities has a field in the visual editor: each node page
(grid, solar, home, battery, charging source) carries an **Energy** section, as
does each entry in the battery, PV-source and charging-source lists, and each
individual device.

Large totals switch to MWh so they do not crowd the layout:

```yaml
kwh_threshold: 1000   # kWh at which MWh takes over; 0 disables the switch
mwh_decimals: 2
```

### Where the lists go (`*_position`)

Each breakdown list can be parked in any zone around the diagram, so the layout
follows your setup rather than the other way round:

```yaml
solar_position: top        # top (default) | bottom | left | right
battery_position: bottom   # top | bottom (default) | left | right
charger_position: bottom   # top | bottom (default) | left | right
individual_position: right # grid (default, circles) | top | bottom | left | right
```

Side zones stack one entry per row; top and bottom fit two per row where there is
width for it. `individual_position: grid` is the only value that keeps the
devices as circles in the diagram — every other value lists them instead.

### Width (`reserve_side_width`, `max_width`)

```yaml
reserve_side_width: true   # keep the side lists' space free while they are empty
max_width: 700             # px, 0 or unset = full card width
```

`reserve_side_width` stops the diagram from jumping sideways when devices appear
in a list left or right of it. It only applies on wide cards; on a narrow card
the lists sit below the diagram and no space is held back. `max_width` caps the
whole card content and centres it.

### PV sources coloured by output (`color_solar_by_output`)

```yaml
color_solar_by_output: true
solar_color_max: 10000        # fallback for sources without their own peak
entities:
  solar:
    sources:
      - entity: sensor.roof_power
        name: Roof 10 kWp
        color_max: 10000       # this array's peak power in watts
        energy_entity: sensor.roof_energy
      - entity: sensor.balcony_power
        name: Balcony 800 Wp
        color_max: 800
        energy_entity: sensor.balcony_energy
```

Red when idle, orange in between, green at peak — the mirror image of the usage
colouring. **Each array is measured against its own `color_max`**, so a 800 Wp
balcony unit at full tilt reads as green just like a 10 kWp roof array does.
Without `color_max` a source falls back to `solar_color_max`, then to
`max_expected_power`. The power value is tinted along with the icon and the
accent bar.

At zero output the row turns **grey** rather than red: producing nothing at
night is not a fault, and red is reserved for an array that could produce but
barely does.

PV sources and charging sources take `energy_entity` too, so their kWh appear in
the list alongside the batteries and individual devices.

### Circle tint (`circle_tint`)

For `mushroom` and `bubble`, the circles are filled with the node's colour. The
strength is adjustable, in percent:

```yaml
appearance: bubble
circle_tint: 35        # 0 = neutral background, 100 = solid; default 20 (mushroom) / 22 (bubble)
entities:
  solar:
    circle_tint: 60    # a single node can override the card-wide value
```

Every node page in the editor has the field, and the card-wide value sits in the
advanced options. Has no effect on `classic`.

### Circle outline (`circle_outline`)

`mushroom` draws its circles without an outline, `bubble` with a thin tinted one.
`circle_outline` overrides that for the whole card, in pixels:

```yaml
appearance: mushroom
circle_outline: 2      # 0 = no outline, 1-4 = outline in the node's colour; unset = appearance default
```

Has no effect on `classic`, whose circles always keep their ring.

### Bubble appearance

`appearance: bubble` styles the card after [Bubble Card](https://github.com/Clooos/Bubble-Card):
soft bubbles with a thin outline and shadow instead of rings, pill-shaped list
entries with a round icon, raised pill buttons for the W / kWh switch and the
period picker (the active one filled with the accent colour), and a rounded card.
It reads the `--bubble-*` theme variables (`--bubble-accent-color`,
`--bubble-border-radius`, `--bubble-main-background-color`,
`--bubble-icon-background-color`) and falls back to your Home Assistant theme
when they are not set. Like `mushroom`, it is a pure styling switch.

### Mushroom appearance

Set `appearance: mushroom` to restyle the card so it sits comfortably next to
[Mushroom](https://github.com/piitaya/lovelace-mushroom) cards. This is a pure
styling switch — no entity, layout or behaviour change — so you can flip between
the two looks at any time.

```yaml
type: custom:power-flow-card-plus-mushroom
appearance: mushroom   # classic (default) | mushroom | bubble
entities:
  grid:
    entity: sensor.grid_power
```

What changes compared to `classic`:

- **Shapes instead of rings** — the circles lose their 2px outline and are filled
  with their own colour at 20% opacity, with the icon in full colour. This is the
  same shape treatment Mushroom uses for its icons.
- **Typography** — values and labels adopt Mushroom's weights and sizes;
  secondary info is dimmed rather than drawn in full contrast.
- **Softer flow lines** — slightly thicker with rounded caps, so they read as
  strokes rather than hairlines.
- **Breakdown list as chips** — the docked list of PV sources / batteries / extra
  individual devices becomes a row of tinted chips with their own icon shapes,
  instead of the left-border list style.

#### Fine-tuning

Three CSS custom properties are available, settable per card via
`style_card_content` or globally in your theme:

| Property                | Default                               | Description                                                      |
| ----------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| `--pfcp-shape-strength` | `20%`                                 | Opacity of the shape fill. Lower is subtler, higher is bolder.    |
| `--pfcp-shape-radius`   | `var(--mush-icon-border-radius, 50%)` | Shape corner radius. Follows your Mushroom theme if it sets one.  |
| `--pfcp-shape-fallback` | `var(--primary-color)`                | Fill colour used when a node has no colour of its own.            |

For squared shapes, matching a Mushroom theme with squared icons:

```yaml
appearance: mushroom
style_card_content: "--pfcp-shape-radius: 12px;"
```

> [!NOTE]
> The shape fill uses the CSS `color-mix()` function. Every browser Home
> Assistant currently supports handles it; on an older browser the shapes simply
> render transparent rather than breaking the layout.


## Goal

The Goal of this card is to provide an easy to understand and visualize way of displaying the current Power Distribution coming from and to different sources, such as solar, grid, home batteries etc. Furthermore, this card aims to expose a lot of customizability and control of its behavior to the configuration, allowing users to tailor it to their specific requirements.

## Scope

This card **does not** aim to display Energy Values (Meaning accumulated power over 1 day, for example).
If this is your goal, check out the [Energy Flow Card Plus](https://github.com/flixlix/energy-flow-card-plus).

## Guides

In case you want to watch a tutorial instead of reading through this very long readme 😅, I recommend the following videos.

> [!NOTE]
> These videos cover the **original** card. They are still a good introduction to the shared options, but they do not show this fork's additions (multiple batteries, multiple PV sources, unlimited individual devices, Mushroom appearance).

- [Power Flow Card Plus in Home Assistant - Jetzt noch besser? Anleitung from Smartzeug](https://youtu.be/PUOU5qdhMro) - _in german_, up to date with version 0.2.2
- [Power Flow Card Plus for Home Assistant from Speak to the Geek](https://youtu.be/C4Zh35E9wJE?si=REuWZxmfF91G0Ht7) - _changes in indvidual configuration_

## Installation

### HACS (custom repository)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=sphings79&repository=power-flow-card-plus-mushroom&category=Dashboard)

This fork is **not** in the HACS default store, so searching for it will not find it. Add it as a custom repository first. To install HACS itself, follow these [instructions](https://hacs.xyz/docs/setup/prerequisites).

1. In Home Assistant, open **HACS**.
2. Open the three-dot menu (top right) and choose **Custom repositories**.
3. Repository: `https://github.com/sphings79/power-flow-card-plus-mushroom` — Category: **Dashboard**.
4. Add it, then search for **Power Flow Card Plus Mushroom** in HACS and download it.

The button above does steps 1–3 for you.

<details>
<summary>Manual install</summary>

1. Download and copy `power-flow-card-plus-mushroom.js` from the [latest release](https://github.com/sphings79/power-flow-card-plus-mushroom/releases/latest) into your `config/www` directory.

2. Add the resource reference as decribed below.

### Add resource reference

If you configure Dashboards via YAML, add a reference to `power-flow-card-plus-mushroom.js` inside your `configuration.yaml`:

```yaml
resources:
  - url: /local/power-flow-card-plus-mushroom.js
    type: module
```

Else, if you prefer the graphical editor, use the menu to add the resource:

1. Make sure, advanced mode is enabled in your user profile (click on your user name to get there)
2. Navigate to Settings -> Dashboards
3. Click three dot icon
4. Select Resources
5. Hit (+ ADD RESOURCE) icon
6. Enter URL `/local/power-flow-card-plus-mushroom.js` and select type "JavaScript Module".
   (Use `/hacsfiles/power-flow-card-plus-mushroom/power-flow-card-plus-mushroom.js` and select "JavaScript Module" for HACS install if HACS didn't do it already)

</details>

## Usage

> [!WARNING]  
> This card offers a **LOT** of configuration options. Don't worry, if you want your card's appearance to match the oficial Energy Flow Card, you will only need to setup the entities. The rest of the options only enable further customization. If this is your goal, please go to [Minimal Configuration](#minimal-configuration)

### Options

#### Card options

| Name                        | Type      |                 Default                  | Description                                                                                                                                                                                                              |
| --------------------------- | --------- | :--------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| type                        | `string`  |               **required**               | `custom:power-flow-card-plus-mushroom`.                                                                                                                                                                                           |
| entities                    | `object`  |               **required**               | One or more sensor entities, see [entities object](#entities-object) for additional entity options.                                                                                                                      |
| title                       | `string`  |                                          | Shows a title at the top of the card.                                                                                                                                                                                    |
| dashboard_link              | `string`  |                                          | Shows a link to an Energy Dashboard. Should be a url path to location of your choice. If you wanted to link to the built-in dashboard you would enter `/energy` for example.                                             |
| dashboard_link_label        | `string`  | Go To Energy Dashboard (auto-translates) | If set, overrides the default link label to go to a different dashboard.                                                                                                                                                 |
| second_dashboard_link       | `string`  |                                          | Shows another link to an Energy Dashboard. Should be a url path to location of your choice. If you wanted to link to the built-in dashboard you would enter `/energy` for example. (Only available in the YAML Editor)   |
| second_dashboard_link_label | `string`  | Go To Energy Dashboard (auto-translates) | If set, overrides the second default link label to go to a different dashboard.                                                                                                                                          |
| kw_decimals                 | `number`  |                    1                     | Number of decimals rounded to when kilowatts are displayed.                                                                                                                                                              |
| w_decimals                  | `number`  |                    1                     | Number of decimals rounded to when watts are displayed.                                                                                                                                                                  |
| min_flow_rate               | `number`  |                   .75                    | Represents how much time it takes for the quickest dot to travel from one end to the other in seconds.                                                                                                                   |
| max_flow_rate               | `number`  |                    6                     | Represents how much time it takes for the slowest dot to travel from one end to the other in seconds.                                                                                                                    |
| watt_threshold              | `number`  |                    0                     | The number of watts to display before converting to and displaying kilowatts. Setting of 0 will always display in kilowatts.                                                                                             |
| clickable_entities          | `boolean` |                  false                   | If true, clicking on the entity will open the entity's more info dialog.                                                                                                                                                 |
| min_expected_power          | `number`  |                   0.01                   | Represents the minimum amount of power (in Watts) expected to flow through the system at a given moment. Only used in the [New Flow Formula](#new-flow-formula).                                                         |
| max_expected_power          | `number`  |                   2000                   | Represents the maximum amount of power (in Watts) expected to flow through the system at a given moment. Only used in the [New Flow Formula](#new-flow-formula).                                                         |
| display_zero_lines          | `object`  |             `{mode: "show"}`             | Check [Display Zero Lines](#display-zero-lines)                                                                                                                                                                          |
| full_size                   | `boolean` |                  false                   | Warning: This option is experimental. To use this option, you must set your view to panel mode. If set to true, the card will take up the full height of the screen. And the Card should go to the center of the screen. |
| style_ha_card               | `css`     |                                          | [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) Styling to apply to the container of the card (border and background of the card).                                                                               |
| style_card_content          | `css`     |                                          | [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) Styling to apply to the content of the card (all circles and lines of the card).                                                                                 |
| use_new_flow_rate_model     | `boolean` |                  false                   | If `true`, the card will use the [New Flow Formula](#new-flow-formula).                                                                                                                                                  |
| sort_individual_devices     | `boolean` |           true (since v0.3.1)            | If `true`, sort devices in order of power consumption -> entity id -> alphabetically.                                                                                                                                    |
| allow_layout_break          | `boolean` |                  false                   | Always allow up to 4 individual devices to show, even when there is not enough space, causing visual layout break.                                                                                                       |
| appearance                  | `string`  |                `classic`                 | `classic` keeps the original outlined-circle look. `mushroom` restyles the card to match [Mushroom](https://github.com/piitaya/lovelace-mushroom) cards — see [Mushroom appearance](#mushroom-appearance). `bubble` follows [Bubble Card](https://github.com/Clooos/Bubble-Card) — see [Bubble appearance](#bubble-appearance).                |

#### Action Configuration

The card supports Home Assistant action configs on entity circles and other clickable entity surfaces.

| Name              | Type     | Description                           |
| ----------------- | -------- | ------------------------------------- |
| tap_action        | `object` | Action triggered on tap/click.        |
| hold_action       | `object` | Action triggered on long press.       |
| double_tap_action | `object` | Action triggered on double tap/click. |

If none of these actions are configured for a clickable entity surface, the card falls back to opening more-info when `clickable_entities: true`.

#### Entities object

At least one of _grid_, _battery_, or _solar_ is required. All entites (except _battery_charge_) should have a `unit_of_measurement` attribute of W(watts) or kW(kilowatts).

| Name                   | Type     | Description                                                                      |
| ---------------------- | :------- | -------------------------------------------------------------------------------- |
| grid                   | `object` | Check [Grid Configuration](#grid-configuration) for more information.            |
| solar                  | `object` | Check [Solar Configuration](#solar-configuration) for more information.          |
| battery                | `object` | Check [Battery Configuration](#battery-configuration) for more information.      |
| individual             | `array`  | Check [Individual Devices](#individual-configuration) for more information.      |
| home                   | `object` | Check [Home Configuration](#home-configuration) for more information.            |
| fossil_fuel_percentage | `object` | Check [Fossil Fuel Percentage](#fossil-fuel-configuration) for more information. |

#### Grid Configuration

| Name                   | Type                                                           | Default                                                                                                      | Description                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| entity                 | `string` or `object`                                           | `undefined` required                                                                                         | Entity ID of a sensor supporting a single state with negative values for production and positive values for consumption or an object for [split entites](#split-entities). Examples of both can be found below.                                                                                                                                                                               |
| name                   | `string`                                                       | `Grid`                                                                                                       | If you don't populate this option, the label will continue to update based on the language selected.                                                                                                                                                                                                                                                                                          |
| icon                   | `string`                                                       | `mdi:transmission-tower`                                                                                     | Icon path for the icon inside the Grid Circle.                                                                                                                                                                                                                                                                                                                                                |
| color                  | `object`                                                       |                                                                                                              | Check [Color Objects](#color-object) for more information.                                                                                                                                                                                                                                                                                                                                    |
| color_icon             | "color_dynamically", "no_color", "production" or "consumption" | `no_color`                                                                                                   | If set to `color_dynamically`, icon color will match the highest value. If set to `production`, icon color will match the production. If set to `consumption`, icon color will match the consumption.                                                                                                                                                                                         |
| display_state          | "two_way" or "one_way" or "one_way_no_zero"                    | `two_way`                                                                                                    | If set to `two_way` the production will always be shown simultaneously, no matter the state. If set to `one_way` only the direction that is active will be shown (since this card only shows instantaneous power, there will be no overlaps ✅). If set to `one_way_no_zero` the behavior will be the same as `one_way` but you will still the consumption direction when every state is `0`. |
| color_circle           | "color_dynamically", or "production" or "consumption"          | `consumption`                                                                                                | If set to `color_dynamically`, the color of the grid circle changes depending on if you are consuming from the grid or returning to it. If set to `production`, circle color will match the production. If set to `consumption`, circle color will match the consumption.                                                                                                                     |
| secondary_info         | `object`                                                       | `undefined`                                                                                                  | Check [Secondary Info Object](#secondary-info-configuration)                                                                                                                                                                                                                                                                                                                                  |
| display_zero_tolerance | `number`                                                       | `0`                                                                                                          | If the state of the entity is less than this number, it will be considered zero. This is to avoid having the grid circle show a small amount of consumption when the battery is trying to correct itself to the grid.                                                                                                                                                                         |
| power_outage           | `object`                                                       | `undefined`                                                                                                  | Configure how the card handles a power outage. Check [Power Outage](#power-outage) for more info.                                                                                                                                                                                                                                                                                             |
| color_value            | `boolean`                                                      | Default is `true`. If set to `false`, the values of power will not be colored according to input and output. |                                                                                                                                                                                                                                                                                                                                                                                               |
| invert_state           | `boolean`                                                      | `false`                                                                                                      | If set to true the direction as well as the values will be inverted, meaning a positive value will be shown as production and a negative value will be shown as consumption.                                                                                                                                                                                                                  |

#### Solar Configuration

| Name               | Type      | Default              | Description                                                                                                                                                        |
| ------------------ | --------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| entity             | `string`  | `undefined` required | Entity ID providing a state with the value of solar production.                                                                                                    |
| name               | `string`  | `Solar`              | Label for the solar option. If you don't populate this option, the label will continue to update based on the language selected.                                   |
| icon               | `string`  | `mdi:solar-power`    | Icon path for the icon inside the Solar Circle.                                                                                                                    |
| color              | `string`  |                      | HEX value of the color for circles labels and lines of solar production.                                                                                           |
| color_icon         | `boolean` | `false`              | If set to `true`, icon color will match the circle's color. If set to `false`, icon color will match the text's color.                                             |
| color_value        | `boolean` | `false`              | If set to `true`, text color of the state will match the circle's color. If set to `false`, text color of the state will be your primary text color.               |
| secondary_info     | `object`  | `undefined`          | Check [Secondary Info Object](#secondary-info-configuration)                                                                                                       |
| display_zero       | `boolean` | `true`               | If set to `true`, the device will be displayed even if the entity state is `0` or not a number (eg: `unavailable`). Otherwise, the solar circle will be hidden.    |
| display_zero_state | `boolean` | `true`               | If set to `true`, the state will be shown even if it is `0`. If set to `false`, the state will be hidden if it is `0`.                                             |
| invert_state       | `boolean` | `false`              | If set to true the direction as well as the values will be inverted, meaning a negative value will be shown as production and a negative value will be shown as 0. |

#### Battery Configuration

| Name                             | Type                                                           | Default                                                | Description                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| entity                           | `string` or `object`                                           | `undefined` required                                   | Entity ID of a sensor supporting a single state with negative values for production and positive values for consumption or an object for [split entities](#split-entities). Examples of both can be found below.                                                                                                                                                                              |
| state_of_charge                  | `string`                                                       | `undefined` required                                   | Entity ID providing a state with the state of charge of the battery in percent (state of `100` for a full battery).                                                                                                                                                                                                                                                                           |
| state_of_charge_unit             | `string`                                                       | `%`                                                    | Unit of the state of charge.                                                                                                                                                                                                                                                                                                                                                                  |
| state_of_charge_unit_white_space | `boolean`                                                      | `true`                                                 | If set to `false`, the unit of the state of charge will not have a white space in front of it.                                                                                                                                                                                                                                                                                                |
| state_of_charge_decimals         | `number`                                                       | `0`                                                    | Number of decimals to show for the state of charge.                                                                                                                                                                                                                                                                                                                                           |
| name                             | `string`                                                       | `Battery`                                              | Label for the battery option. If you don't populate this option, the label will continue to update based on the language selected.                                                                                                                                                                                                                                                            |
| icon                             | `string`                                                       | `mdi:battery` or dynamic based on state of the battery | Icon path for the icon inside the Battery Circle.                                                                                                                                                                                                                                                                                                                                             |
| color                            | `object`                                                       |                                                        | Check [Color Objects](#color-object) for more information.                                                                                                                                                                                                                                                                                                                                    |
| color_icon                       | "color_dynamically", "no_color", "production" or "consumption" | `no_color`                                             | If set to `color_dynamically`, icon color will match the highest value. If set to `production`, icon color will match the production. If set to `consumption`, icon color will match the consumption.                                                                                                                                                                                         |
| display_state                    | "two_way" or "one_way" or "one_way_no_zero"                    | `two_way`                                              | If set to `two_way` the production will always be shown simultaneously, no matter the state. If set to `one_way` only the direction that is active will be shown (since this card only shows instantaneous power, there will be no overlaps ✅). If set to `one_way_no_zero` the behavior will be the same as `one_way` but you will still the consumption direction when every state is `0`. |
| state_of_charge_unit_white_space | `boolean`                                                      | `true`                                                 | If set to `false`, there will be no white space between the state of charge and the unit of the state of charge.                                                                                                                                                                                                                                                                              |
| color_state_of_charge_value      | "color_dynamically", "no_color", "production" or "consumption" | `no_color`                                             | If set to `color_dynamically`, state of charge text color will match the highest value. If set to `production`, state of charge text color will match the production. If set to `consumption`, state of charge text color will match the consumption.                                                                                                                                         |
| color_circle                     | "color_dynamically" or "production" or "consumption"           | `consumption`                                          | If set to `color_dynamically`, circle color will match the highest value. If set to `production`, circle color will match the production. If set to `consumption`, circle text color will match the consumption.                                                                                                                                                                              |
| color_value                      | `boolean`                                                      | `true`                                                 | If set to `false`, the values of power will not be colored according to input and output.                                                                                                                                                                                                                                                                                                     |
| invert_state                     | `boolean`                                                      | `false`                                                | If set to true the direction as well as the values will be inverted, meaning a positive value will be shown as production and a negative value will be shown as consumption.                                                                                                                                                                                                                  |

#### Individual Configuration

The Individual fields must be an array of objects. Each object must follow the following structure:

| Name                   | Type      | Default                                        | Description                                                                                                                                                                          |
| ---------------------- | --------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| entity                 | `string`  | `undefined` required                           | Entity ID providing a state with the value of an individual consumption.                                                                                                             |
| name                   | `string`  | `Car` or `Motorcycle`                          | Label for the individual device option. If you don't populate this option, the label will continue to update based on the language selected.                                         |
| icon                   | `string`  | `mdi:car-electric` or `mdi:motorbike-electric` | Icon path for the icon inside the Individual Device Circle.                                                                                                                          |
| color                  | `string`  | `#d0cc5b` or `#964cb5`                         | HEX value of the color for circles labels and lines of the individual device.                                                                                                        |
| color_icon             | `boolean` | `false`                                        | If set to `true`, icon color will match the circle's color. If set to `false`, icon color will match the text's color.                                                               |
| unit_of_measurement    | `string`  | `W`or `kW` (dynamic)                           | Sets the unit of measurement to show in the corresponding circle                                                                                                                     |
| inverted_animation     | `boolean` | `false`                                        | If set to true, the small dots will flow in the opposite direction.                                                                                                                  |
| secondary_info         | `object`  | `undefined`                                    | Check [Secondary Info Object](#secondary-info-configuration). The `secondary_info` entity can provide a number or a string (eg: EV State `charging` and `discharging`).              |
| display_zero           | `boolean` | `false`                                        | If set to `true`, the device will be displayed even if the entity state is `0` or not a number (eg: `unavailable`). Otherwise, the non-fossil section will be hidden.                |
| display_zero_tolerance | `number`  | `0`                                            | If set, the device will be displayed if the state is greater than the tolerance set (This is also available for the secondary info). No need to set `display_zero` property to true. |
| display_zero_state     | `boolean` | `true`                                         | If set to `true`, the state will be shown even if it is `0`. If set to `false`, the state will be hidden if it is `0`.                                                               |
| color_value            | `boolean` | `false`                                        | If set to `true`, state text color will match the circle's color. If set to `false`, state text color will be the primary text color.                                                |
| decimals               | `number`  | `0`                                            | Number of decimals to show in the corresponding state.                                                                                                                               |

#### Home Configuration

| Name                | Type                                        | Default              | Description                                                                                                                                                                                                                                                                                                 |
| ------------------- | ------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| entity              | `string`                                    | `undefined` required | Entity ID providing a state with the value of your home's consumption. Note that this entity will not be displayed and will only be used for the more info dialog when clicking the home section.                                                                                                           |
| name                | `string`                                    | `Home`               | Label for the home option. If you don't populate this option, the label will continue to update based on the language selected.                                                                                                                                                                             |
| icon                | `string`                                    | `mdi:home`           | Icon path for the icon inside the Home Circle.                                                                                                                                                                                                                                                              |
| color_icon          | `boolean` or "solar" or "grid" or "battery" | `false`              | If set to `true`, icon color will match the highest value. If set to `solar`, icon color will match the color of solar. If set to `grid`, icon color will match the color of the grid consumption. If set to `battery`, icon color will match the color of the battery consumption.                         |
| color_value         | `boolean` or "solar" or "grid" or "battery" | `false`              | If set to `true`, state text color will match the highest value. If set to `solar`, state text color will match the color of solar. If set to `grid`, state text color will match the color of the grid consumption. If set to `battery`, state text color will match the color of the battery consumption. |
| secondary_info      | `object`                                    | `undefined`          | Check [Secondary Info Object](#secondary-info-configuration)                                                                                                                                                                                                                                                |
| subtract_individual | `boolean`                                   | false                | If set to `true`, the home consumption will be calculated by subtracting the sum of the individual devices from the home consumption.                                                                                                                                                                       |
| override_state      | `boolean`                                   | `false`              | If set to `true`, the home consumption will be the state of the entity provided. By default the home consumption is caluclated by adding up all sources. This is useful, when for example you are using an inverter and it has power losses.                                                                |

#### Fossil Fuel Configuration

| Name                | Type                  | Default         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------- | --------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| entity              | `string`              | `none` required | Entity ID providing a state with the value of the percentage of fossil fuel consumption. The state should be `100` when all the energy from the grid comes from high emission sources and `0` when all the energy from the grid comes from low emission sources. It is recommended to use the CO2 Signal integration, which provides this sensor out of the box without any additional templating. This will also be the entity used in the more-info dialogs. |
| name                | `string`              | Low-carbon      | Name to appear as a label on top of the circle.                                                                                                                                                                                                                                                                                                                                                                                                                |
| icon                | `string`              | `mdi:leaf`      | Icon path (eg: `mdi:home`) to display inside the circle of the device.                                                                                                                                                                                                                                                                                                                                                                                         |
| color               | `string`              | `#0f9d58`       | HEX Value of a color to display as the stroke of the circle and line connecting to the grid.                                                                                                                                                                                                                                                                                                                                                                   |
| color_icon          | `boolean`             | `false`         | If `true`, the icon will be colored with the color property. Otherwise it will be the same color as all other icons.                                                                                                                                                                                                                                                                                                                                           |
| display_zero        | `boolean`             | `true`          | If set to `true`, the device will be displayed even if the entity state is `0` or not a number (eg: `unavailable`). Otherwise, the non-fossil section will be hidden.                                                                                                                                                                                                                                                                                          |
| display_zero_state  | `boolean`             | `true`          | If set to `true`, the state will be shown even if it is `0`. If set to `false`, the state will be hidden if it is `0`.                                                                                                                                                                                                                                                                                                                                         |
| state_type          | `string`              | `power`         | The type of state to use for the entity. Can be `power` or `percentage`. When set to `power` the state will be the amount of power from the grid that is low-carbon. When set to `percentage` the state will be the percentage of power from the grid that is low-carbon.                                                                                                                                                                                      |
| unit_white_space    | `boolean`             | `true`          | If set to `false` will not add any whitespace between unit and state. Otherwise, white space will be added.                                                                                                                                                                                                                                                                                                                                                    |
| calculate_flow_rate | `boolean` or `number` | `false`         | If set to `true`, the flow rate will be calculated by using the flow rate formula (either the new or the old one, depending on your configuration). If set to a number, the flow rate will be set to that number. For example, defining the value `10` will ensure one dot will flow every 10 seconds.                                                                                                                                                         |

#### Color Object

| Name        | Type     | Description                                                         |
| ----------- | -------- | ------------------------------------------------------------------- |
| production  | `string` | HEX value of the color for circles labels and lines of production.  |
| consumption | `string` | HEX value of the color for circles labels and lines of consumption. |

#### Split entities

Can be use with either Grid or Battery configuration. The same `unit_of_measurement` rule as above applies.

| Name        | Type     | Description                                                                                       |
| ----------- | -------- | ------------------------------------------------------------------------------------------------- |
| consumption | `string` | Entity ID providing a state value for consumption, this is required if using a split grid object. |
| production  | `string` | Entity ID providing a state value for production                                                  |

#### Secondary Info Configuration

This Feature allows you to configure an additional small text for each Individual Device. Here you can put , for example, the state of charge of an electric car.

| Name                   | Type              | Description                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| entity                 | `string` required | Entity ID providing a state value that is going to be displayed.                                                                                                                                                                                                                                                                                                                                             |
| unit_of_measurement    | `string`          | A string to be used as the unit of measurement. (Important: don't forget surrounding string with quotes)                                                                                                                                                                                                                                                                                                     |
| icon                   | `string`          | An icon path to be displayed next to the state of the individual device. This is optional, meaning if you don't use this, no icon will be displayed.                                                                                                                                                                                                                                                         |
| unit_white_space       | `boolean`         | Default is `true`. If set to `false` will not add any whitespace between unit and state. Otherwise, white space will be added.                                                                                                                                                                                                                                                                               |
| display_zero           | `boolean`         | Default is `false`. If set to `true` info will still be displayed if state of the entity is `0` or `unavailable`.                                                                                                                                                                                                                                                                                            |
| display_zero_tolerance | `number`          | If set, the device will be displayed if the state is greater than the tolerance set. No need to set `display_zero` property to true.                                                                                                                                                                                                                                                                         |
| decimals               | `number`          | The number of decimal places to round the value to.                                                                                                                                                                                                                                                                                                                                                          |
| template               | `string`          | Here you can enter a [HA Template](https://www.home-assistant.io/docs/configuration/templating/). The output of the template will be displayed. Space is limited inside the circle and too much text will result in overflow using ellipsis, so use with caution. Will update automatically in case one of the provided entities inside the template updates. Can only be used in case `entity` was not set. |
| accept_negative        | `boolean`         | Default is `false`. If set to `true`, negative values will be displayed as negative, otherwise they will be transformed to positive                                                                                                                                                                                                                                                                          |
| sum_total              | `boolean`         | The secondary info field on the solar bubble can be used as a second string and be summed with the main entity to create a total of solar consumption. By default, these two values are completely decoupled.                                                                                                                                                                                                |
| tap_action             | `object`          | Action triggered on tap/click on the secondary info text.                                                                                                                                                                                                                                                                                                                                                    |
| hold_action            | `object`          | Action triggered on long press on the secondary info text.                                                                                                                                                                                                                                                                                                                                                   |
| double_tap_action      | `object`          | Action triggered on double tap/click on the secondary info text.                                                                                                                                                                                                                                                                                                                                             |

#### Power Outage

This feature allows you to configure how the card handles a Grid Power Outage scenario.

| Name                | Type                  | Description                                                                                                                                                                                                                                                                                            |
| ------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| entity              | `string` required     | Entity ID providing a state that changes when there is a Power Outage. (eg: `binary_sensor.grid_connection_status`). Doesn't need to be a binary_sensor.                                                                                                                                               |
| entity_generator    | `string`              | Entity ID providing the power of a Generator. (eg: `sensor.generator_power`). This is optional, meaning if you don't use this, the card will assume the grid is the only source of power.                                                                                                              |
| state_alert         | `string`              | The state the provided entity is at when there is a power outage. Default is `on`, meaning if the entity's state is `on` the card will assume there is a power outage.                                                                                                                                 |
| icon_alert          | `string`              | An icon path to be override the grid icon when there is a power outage. Default is `mdi:transmission-tower-off`.                                                                                                                                                                                       |
| label_alert         | `string`              | A text that will be displayed below the icon when there is a power outage.                                                                                                                                                                                                                             |
| calculate_flow_rate | `boolean` or `number` | `false`                                                                                                                                                                                                                                                                                                |
|                     |                       | If set to `true`, the flow rate will be calculated by using the flow rate formula (either the new or the old one, depending on your configuration). If set to a number, the flow rate will be set to that number. For example, defining the value `10` will ensure one dot will flow every 10 seconds. |

#### Display Zero Lines

This object allows you to control the behavior of the flow lines that are inactive.

| Name         | Type                          | Description                                                                                                                                                                                 |
| ------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| mode         | string                        | Valid Options are: `show`, `hide`, `transparency`, `grey_out`, `custom`                                                                                                                     |
| transparency | number                        | A number between 0 and 100. 100 means the line doesn't show at all. 0 means the line shows in full opacity. Default is 50. Will be used when the mode is either `transparency` or `custom`. |
| grey_color   | `string` or `list of numbers` | Either a HEX Code or a List of three numbers between 0 and 255 in RGB order. Will be used when the mode is either `grey_out` or `custom`.                                                   |

### Minimal Configuration

> Don't forget to change the entity ids

The following configurations will allow you to achieve your results with the least amount of lines of code / complexity.
In these examples I decided to use the Split entities option, but feel free to use the combined entity option. [More Info](#split-entities)

#### Only Grid

```yaml
type: custom:power-flow-card-plus-mushroom
entities:
  grid:
    entity: sensor.grid_power
    power_outage:
      entity: sensor.power_outage
    display_state: one_way
    color_circle: true
watt_threshold: 10000
```

This should give you something like this:

<img src="docs/images/demo-grid-only.svg" alt="The card configured with the grid only" width="52%">

##### Grid and Solar

```yaml
type: custom:power-flow-card-plus-mushroom
entities:
  grid:
    entity:
      consumption: sensor.grid_consumption
      production: sensor.grid_production
      display_state: one_way
      color_circle: true
  solar:
    entity: sensor.solar_production
```

This should give you something like this:

<img src="docs/images/demo-solar-and-grid.svg" alt="The card configured with grid and solar" width="52%">

##### Grid, Solar and Battery

```yaml
type: custom:power-flow-card-plus-mushroom
entities:
  grid:
    entity:
      consumption: sensor.grid_consumption
      production: sensor.grid_production
    display_state: one_way
    color_circle: true
  solar:
    entity: sensor.solar_production
  battery:
    entity:
      consumption: sensor.battery_consumption
      production: sensor.battery_production
    state_of_charge: sensor.battery_state_of_charge
    display_state: one_way
    color_circle: true
  home:
    color_icon: true
watt_threshold: 10000
```

This should give you something like this:

<img src="docs/images/demo-grid-solar-battery.svg" alt="The card configured with grid, solar and a battery" width="52%">

### Mix & Match Config aka "Full Config"

> This Configuration is a little bit random, it's just here to demonstrate the capabilities of this card.

```yaml
type: custom:power-flow-card-plus-mushroom
entities:
  home:
    entity: sensor.home_consumption
    color_icon: solar
  fossil_fuel_percentage:
    entity: sensor.fossil_fuel_percentage
    icon: mdi:pine-tree
    color_icon: true
    display_zero: true
    name: Non Fossil
    state_type: power
  grid:
    icon: mdi:ab-testing
    name: Provider
    entity:
      production: sensor.grid_production
      consumption: sensor.grid_consumption
  solar:
    icon: mdi:solar-panel-large
    entity: sensor.solar_production
  battery:
    name: Bateria
    icon: mdi:bat
    entity:
      consumption: sensor.battery_consumption
      production: sensor.battery_production
  individual:
    - entity: sensor.car_power
      icon: mdi:car-electric
      color: "#80b8ff"
      name: Denim Flash
      color_icon: false
    - entity: sensor.motorbike_power
      name: Qivi
      color_icon: true
      display_zero: true
      color: "#ff8080"
      icon: mdi:motorbike-electric
w_decimals: 0
kw_decimals: 2
min_flow_rate: 0.9
max_flow_rate: 6
watt_threshold: 10000
clickable_entities: true
title: Power Flow Card Plus
```

This should give you something like this:
<img src="docs/images/minimal-config.svg" alt="The result of the minimal configuration example" width="52%">

### Random Configurations

<img src="docs/images/demo-full.svg" alt="A fully configured card with several PV sources, two batteries and low-carbon energy" width="52%">
<img src="docs/images/demo-individual-devices.svg" alt="Four individual devices in the corner slots and three more in the docked list below" width="52%">

### UI Editor (available in version 0.2)

> [!TIP]
> I've made a lot of improvements in version 0.2 for the UI-Editor. Now each field has its own subpage, meaning there is now much less scrolling.
> The biggest change in the editor is the fact that you can now add up to 4 individual devices, all through the UI! 🥳

<img src="docs/images/ui-editor.svg" alt="The visual card editor with a list of solar sources that can be extended" width="66%">

### Flow Formula

This formula is based on the official formula used by the Energy Distribution card.

```js
max - (value / totalLines) * (max - min);
// max = max_flow_rate
// min = min_flow_rate
// value = line value, solar to grid for example
// totalLines = gridConsumption + solarConsumption + solarToBattery +
//   solarToGrid + batteryConsumption + batteryFromGrid + batteryToGrid
```

### New Flow Formula

In contrast to the old flow formula, this formula calculates the flow rate independently from other lines, making it more intuitive to interpret the perceived power. This means that a state of `10W` will always flow with the same velocity, no matter what other lines are doing. In other words this flow rate is calculated in absolute and not relative values.

To get this new Flow Formula to work, simply set `use_new_flow_rate_model` in the main configuration to true. You may want to play around with the `max_expected_power`, `min_expected_power`, `max_flow_rate` and `min_flow_rate` to get the speeds that you wish

```js
if (value > maxIn) return maxOut; // In case power exceeds maximum expected power, use the fastest speed and ignore the rest.
return ((value - minIn) * (maxOut - minOut)) / (maxIn - minIn) + minOut;

// value = value of the current line to calculate (eg: grid to home)
//
// minIn = amount of watts at which the lowest speed will be selected.
//   ↳ In your configuration this is `min_expected_power`
//   ↳ eg: setting this at `100` means that at `100` watts, the dots will still flow at the lowest speed
// maxIn = amount of watts at which the highest speed will be selected.
//   ↳ In your configuration this is `max_expected_power`
//   ↳ eg: setting this at `2000` means that everything more than `2000` will flow at the highest speed selected
//
// minOut = amount of watts at which the lowest speed will be selected.
//   ↳ In your configuration this is `max_flow_rate`
//   ↳ eg: setting this at `5` means that one dot will take `5` second to travel
// maxOut = amount of watts at which the highest speed will be selected.
//   ↳ In your configuration this is `min_flow_rate`
//   ↳ eg: setting this at `1` means that one dot will take `1` second to travel
```

The following video aims to show the diffence between the two flow formulas:

<https://user-images.githubusercontent.com/61006057/231479254-91d6c625-8f38-4abb-b9ba-8dd24d6395f3.mp4>

Notice that when the Power changes to only coming from the sun, the old formula accelerates to maintain a constant amount of dots/second.
Using the new formula is more intuitive, since you can immediately see that the Solar Power is relatively low since the dots are flowing very slowly.
On the old Flow Formula you might think that the sun is producing a lot of power, which in this case is not true.

At the end of the day these are two options and depending on what you're interested, one might suit you better than the other, that's why I kept the old formula, you have the choice. 🙂

### To-Do List

> [!NOTE]
> This list is inherited from the upstream card. Some of its entries — more than one solar source,
> more than two individual devices — are already implemented in **this fork**; see
> [Fork additions](#fork-additions-multiple-batteries-multiple-pv-unlimited-individual-devices--external-charging).

Here is my to-do list containing a few enhancements I am planning in adding. The ones at the top are bigger priorities, so they’ll probably be available before the ones at the bottom.

- [x] Change Tap Action Behavior to be compatible with Browser Mod
- Fill the circles [#89](https://github.com/flixlix/power-flow-card-plus/issues/89)
- [x] More than two Individual Devices [#54](https://github.com/flixlix/power-flow-card-plus/issues/54)
- More than one solar source [#23](https://github.com/flixlix/power-flow-card-plus/issues/23)
- Display Connected/Disconnected status [#111](https://github.com/flixlix/power-flow-card-plus/issues/111)
- Grid Feed In Circle [#119](https://github.com/flixlix/power-flow-card-plus/issues/119)
- Improve performance [#144](https://github.com/flixlix/power-flow-card-plus/issues/144)

I am still just one person working on this project and obviously have other things going on in my life, so feel free to contribute to the project. You can also feel free to create a PR with a new feature and I'll try my best to review it 😊

---

## Sponsor this project

These tools are built and maintained in my free time, and they stay free, open and cloud-free.
If one of them saved you an afternoon, you can [buy me a coffee](https://buymeacoffee.com/sphings).

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-sphings-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=000000)](https://buymeacoffee.com/sphings)
