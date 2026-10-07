import { html, nothing } from "lit";
import { PowerFlowCardPlus } from "@/power-flow-card-plus";
import { PowerFlowCardPlusConfig } from "@/power-flow-card-plus-config";
import localize from "@/localize/localize";
import { PICKER_UNITS } from "@/energy/energy-totals";

/** Human-readable label of the range the picker is showing. */
const rangeLabel = (main: PowerFlowCardPlus, language: string): string => {
  const { start, end } = main.energyRange;
  const { unit } = main.pickerState;
  // The range ends at the start of the next unit; show the last day it covers.
  const last = new Date(Math.min(end.getTime(), Date.now()) - 1);
  const fmt = (opts: Intl.DateTimeFormatOptions, d: Date) => new Intl.DateTimeFormat(language, opts).format(d);
  switch (unit) {
    case "year":
      return fmt({ year: "numeric" }, start);
    case "month":
      return fmt({ month: "long", year: "numeric" }, start);
    case "week":
      return `${fmt({ day: "numeric", month: "short" }, start)} – ${fmt({ day: "numeric", month: "short" }, last)}`;
    default:
      return fmt({ day: "numeric", month: "long", year: "numeric" }, start);
  }
};

/**
 * Watt / kWh switch in the card header, plus the optional period picker.
 *
 * Only rendered when at least one energy entity is configured — without one there
 * is nothing to switch to, and an inert control would just be confusing.
 */
export const energyToggleElement = (main: PowerFlowCardPlus, config: PowerFlowCardPlusConfig, hasEnergy: boolean) => {
  if (!hasEnergy || config.energy_toggle === false) return nothing;

  const picker = config.energy_period_picker === true;
  const periodLabel = localize(`editor.energy_period_${config.energy_period ?? "today"}`);

  const toggle = html`<div class="pfcp-energy-toggle ${picker ? "in-bar" : ""}" role="group" aria-label="${localize("editor.energy_toggle")}">
    <button
      type="button"
      class="pfcp-energy-option ${!main.energyMode ? "active" : ""}"
      aria-pressed=${!main.energyMode}
      @click=${() => main.setEnergyMode(false)}
    >
      W
    </button>
    <button
      type="button"
      class="pfcp-energy-option ${main.energyMode ? "active" : ""}"
      aria-pressed=${main.energyMode}
      @click=${() => main.setEnergyMode(true)}
    >
      kWh
    </button>
    ${!picker && main.energyMode && periodLabel ? html`<span class="pfcp-energy-period">${periodLabel}</span>` : nothing}
  </div>`;

  if (!picker) return toggle;

  const language = main.hass?.locale?.language ?? main.hass?.language ?? "en";
  const { unit, offset } = main.pickerState;

  // The bar keeps its place in W mode (hidden, not removed), so the diagram does
  // not jump when the user switches to kWh.
  return html`<div class="pfcp-energy-bar">
    ${toggle}
    <div class="pfcp-energy-picker ${main.energyMode ? "" : "hidden"}" role="group" aria-hidden=${!main.energyMode}>
      <div class="pfcp-picker-units">
        ${PICKER_UNITS.map(
          (u) =>
            html`<button
              type="button"
              class="pfcp-energy-option ${unit === u ? "active" : ""}"
              aria-pressed=${unit === u}
              tabindex=${main.energyMode ? 0 : -1}
              @click=${() => main.setPickerUnit(u)}
            >
              ${localize(`editor.picker_${u}`)}
            </button>`
        )}
      </div>
      <div class="pfcp-picker-nav">
        <button
          type="button"
          class="pfcp-energy-option pfcp-picker-arrow"
          aria-label=${localize("editor.picker_previous")}
          tabindex=${main.energyMode ? 0 : -1}
          @click=${() => main.shiftPicker(-1)}
        >
          ‹
        </button>
        <span class="pfcp-energy-period pfcp-picker-range">${rangeLabel(main, language)}</span>
        <button
          type="button"
          class="pfcp-energy-option pfcp-picker-arrow"
          aria-label=${localize("editor.picker_next")}
          tabindex=${main.energyMode ? 0 : -1}
          ?disabled=${offset >= 0}
          @click=${() => main.shiftPicker(1)}
        >
          ›
        </button>
        <button
          type="button"
          class="pfcp-energy-option"
          tabindex=${main.energyMode ? 0 : -1}
          ?disabled=${offset >= 0}
          @click=${() => main.resetPicker()}
        >
          ${localize("editor.picker_today")}
        </button>
      </div>
    </div>
  </div>`;
};
