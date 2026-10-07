# Changelog

All notable changes to power-flow-card-plus-mushroom, a fork of
[flixlix/power-flow-card-plus](https://github.com/flixlix/power-flow-card-plus).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
For releases before 1.0.0, see the
[upstream changelog](https://github.com/flixlix/flixlix-cards/blob/main/packages/flixlix-cards/power-flow-card-plus/CHANGELOG.md).

## [1.8.1] - 2026-10-07

### Fixed

- The flow lines of the two right-hand individual devices never showed. They were sized in percent of the diagram, but their positioned container made that a percentage of an 80 px box, so they came out zero wide. They are now drawn from the measured positions of the device and home circles, so they attach to the circles at any card width and meet the home circle above and below its centre line.
- The charging-source line (V2L) ran past the battery when a device sat in the right-hand column. With four slots in the row the battery is the second of four, not the middle, and the line is shortened accordingly.
- Mushroom and bubble tinted the PV, grid, home and battery circles with the icon colour, which is the plain text colour unless `color_icon` is set, so they came out grey. They now use the circle colour, the same colour the classic look draws as its ring. This also colours `circle_outline`.
- The values in the breakdown lists did not line up: a short value such as 1 W made its cell narrower than 1,000 W. The value columns now have a fixed minimum width and are right-aligned.
- On narrow cards two breakdown lists sat side by side, overlapped and ran out of the card. Lists now need at least 280 px and stack instead, and a name keeps a minimum width so it is never cut down to one letter.

### Added

- Screenshots of the card in the classic, mushroom and bubble look, in light and dark mode, in English and German: a few in each README, all of them on a [screenshot page](docs/screenshots.md) ([Deutsch](docs/screenshots.de.md)).

## [1.8.0] - 2026-10-07

### Added

- `appearance: bubble`, a third look after [Bubble Card](https://github.com/Clooos/Bubble-Card): soft bubbles with a thin outline and shadow, pill-shaped list entries, raised pill buttons and a rounded card. It reads the `--bubble-*` theme variables and falls back to the Home Assistant theme without them.
- `energy_period_picker`: a day / week / month / year bar with previous / next arrows and a "Today" button, like the Home Assistant energy dashboard, shown next to the W / kWh switch in kWh mode. Its space stays reserved in W mode so the diagram does not jump. The first weekday follows the user's Home Assistant profile.
- `circle_tint` (card-wide, and per node), the strength of the coloured circle background in percent, for `mushroom` and `bubble`.
- `circle_outline`, an outline around the circles in pixels, in the node's colour, for `mushroom` and `bubble`. `0` removes any outline.
- `reserve_side_width`: keeps the width of a side list free while it is empty, so the diagram does not shift when devices appear. Wide cards only.
- `max_width`: caps the width of the card content in pixels and centres it.
- Editor fields for all of the above, and the new labels in every language file.

### Fixed

- The flow diagram now uses the full card width instead of shrinking to its content and squeezing the circles to the left.

### Changed

- `style.ts` and `power-flow-card-plus.ts` are formatted with Prettier; the card's class list is built from an array instead of one long attribute.

## [1.7.3] - 2026-09-19

No functional change to the card.

### Added

- `LICENSE` file (MIT), after the upstream author declared MIT for all of the cards.
- Licence header in the built bundle. HACS downloads only the `.js` file, without a `LICENSE` beside it, so the notice now travels with it.

### Changed

- `license` in `package.json` from `ISC` (an `npm init` leftover) to `MIT`.
- `@license` comments survive minification instead of being stripped wholesale. This also preserves the notices of bundled dependencies such as lit (BSD-3-Clause), which require it; the bundle grows from 342 KB to 349 KB.

### Fixed

- `repository`, `bugs` and `homepage` in `package.json` pointed at `power-flow-card-plus` instead of `power-flow-card-plus-mushroom`, so the links went nowhere.

## [1.7.2] - 2026-08-18

### Fixed

- Horizontal rule and 24 px of reserved space above the top breakdown zone, with nothing above it to separate from. Same specificity trap as the column grid and the side zones before it: `.pfcp-zone-top` carries exactly one class, the general `.pfcp-breakdown` rule does too, and since the zone rule comes first the general one wins.

### Added

- Test covering all four zones for the combined selector. A plain `.pfcp-zone-top {` now fails the suite instead of silently shipping a rule.

## [1.7.1] - 2026-08-18

### Changed

- The Watt/kWh toggle no longer costs a row. It is positioned absolutely in the free top-left corner of the diagram; diagram box and circle positions are unchanged, 110 px remain to the solar circle. That corner is only free while `individual_position` is not `grid`.

### Fixed

- Superfluous separator line above side zones. A side zone sits beside the diagram, not below it, so it separated nothing. Same specificity trap as the column grid: the side-zone rule stood before the general breakdown rule and lost to it at equal specificity.

## [1.7.0] - 2026-08-18

### Added

- `color_battery_by_discharge` with `battery_discharge_max`, and `discharge_color_max` per battery: green at low discharge, red at full load, each battery measured against its own maximum. Charging counts as no discharge and stays green.
- The two battery colourings are independent: `color_battery_by_soc` colours icon and bar by state of charge, `color_battery_by_discharge` colours the power value. One row can carry both — a green bar at 95 % full next to a red value at 7.6 kW discharge.

### Changed

- PV: the numeric value is coloured too, not just the bar.
- PV at 0 W is grey instead of red. A system producing nothing at night is not a fault; red stays reserved for a system that could produce but barely does. Value, bar and icon go grey together.

## [1.6.2] - 2026-08-18

### Changed

- State of charge in the battery list is now the largest number in the row: `1.05rem` semibold with the accent colour, instead of `0.75rem` at 75 % opacity — smaller and paler than every other value in the row, though it is a battery's most important figure. With `color_battery_by_soc: true` the accent follows the charge level (95 % green, 62 % yellow, 33 % orange, 8 % red); without the option it falls back to the normal text colour.

## [1.6.1] - 2026-08-18

### Fixed

- The first statistics fetch went nowhere. It ran in `connectedCallback`, where `hass` is usually not assigned yet, so the query aborted immediately and the next attempt only came with the five-minute timer. The initial fetch now hangs off `updated()`, as soon as `hass` arrives.
- All values disappeared shortly after midnight. For a period without a statistics entry the query returned nothing instead of zero, and "today" has no completed hour at 00:05. An empty response is a valid answer: the value is **0 kWh**, not unknown.
- The debounce is reset after an error so the next refresh tries again.

### Added

- Four tests covering the empty period, summation, the fallback to cumulative sums, and idling with no entities configured.

## [1.6.0] - 2026-08-18

### Added

- `color_solar_by_output` with `color_max` per source: red at nothing, orange between, green at peak output. Every system is measured against its own `color_max`, so an 800 Wp balcony module at full load looks as green as a 10 kWp roof array.
- Free positioning of the lists through `solar_position`, `battery_position`, `charger_position` (`top` | `bottom` | `left` | `right`) and `individual_position` (additionally `grid` for the corner circles). A general zone layout replaces the former fixed sidebar; solar defaults to `top`, matching the solar node.

### Fixed

- `energy_entity` on PV and charger sources had no effect. The editor had offered the field since 1.5.0, but nothing read it, so the per-source kWh stayed empty.
- Names were truncated as soon as two groups stood side by side; the fixed two-column grid is now auto-fit.
- Side zones were too narrow for their content — the rule lost to the general breakdown rule at equal specificity.

## [1.5.0] - 2026-08-18

### Added

- An **Energy** section on every node page of the UI editor. The kWh mode could already be switched on under *Advanced*, period included, but there was no field at all for the kWh entities — those were YAML only, which made the mode practically unusable from the interface. Fields per page:
  - Grid: consumed / returned energy
  - Battery: charged / discharged energy
  - Solar, home, charger: energy entity
  - Each individual device: energy entity
  - Entries in the battery, PV and charger lists: one or two fields depending on type
- **Read state as-is** per field, for sensors that already cover the period. Otherwise the card derives the period value from the statistics of the cumulative meter.

## [1.4.2] - 2026-08-18

### Changed

- Rows in the individual-device list show the configured `name`, else the entity's friendly name, else its id, instead of always the entity — a speaking name is configured in nearly every case. The entity picker in the row gives way to a clickable label that opens the same detail editor as the pencil icon, where the entity stays editable; the id is in the row's tooltip.

## [1.3.1] - 2026-08-18

### Fixed

- Newly added editor fields appeared without a name, or with the raw translation key (`editor.individual_position` and so on). Two causes: the translations were missing — the editor translates through `editor.<name>`, and `localize` returns the key itself when it finds nothing, so they were added for all 18 languages, including `appearance`, unlabelled since the Mushroom option. And the fallback to the schema's `label` never fired, because the expression was chained with `||` and the returned key is truthy. Labels now fall back to `schema.label` explicitly, which keeps future fields readable too.

## [1.2.1] - 2026-08-18

### Added

- `color_individual_by_usage` with `individual_color_max` (default: `max_expected_power`): green at low draw, orange in the middle, red at the top of the scale, so it is visible at a glance which device is pulling.

### Changed

- The breakdown below the diagram places two entries per row — four batteries form a 2×2 block instead of one long column. The sidebar stays single-column; it is too narrow for two.

### Fixed

- Flow lines still ran through the circles. The opaque circle background was not enough on its own: the line overlay renders *after* the rows and therefore sat on top. The circles now have an explicit stacking order and the lines end at the circle edge.

## [1.1.2] - 2026-08-18

### Fixed

- Flow lines ended 16 px short of the circles and sat 16 px above their centre, caused by the `padding` of the line container: at the sides it shortens the lines, at the bottom it lifts them. Measured after the fix: 0 px gap left and right, horizontal lines exactly on circle centre, charger line from circle edge to battery centre. A deliberate deviation from upstream 0.3.7, which has the same gaps — the comparison beforehand measured an identical −16/+16 px in fork and original.
