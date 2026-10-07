import { html, nothing } from "lit";
import { PowerFlowCardPlus } from "@/power-flow-card-plus";
import { ConfigEntities, PowerFlowCardPlusConfig } from "@/power-flow-card-plus-config";
import { generalSecondarySpan } from "./spans/general-secondary-span";
import { displayEnergy, displayValue } from "@/utils/display-value";
import { TemplatesObj } from "@/type";
import { circleTintStyle, isNumberValue } from "@/utils/utils";

/**
 * The external charging source node (V2L, generator, …).
 *
 * Sits in the left slot of the battery row — directly below the grid — and feeds the
 * battery through a single one-way flow line.
 */
export const chargerElement = (
  main: PowerFlowCardPlus,
  config: PowerFlowCardPlusConfig,
  {
    entities,
    charger,
    templatesObj,
  }: {
    entities: ConfigEntities;
    charger: any;
    templatesObj: TemplatesObj;
  }
) => {
  const disableEntityClick = config.clickable_entities === false;

  const shouldShowSecondary = () => {
    if (!charger?.secondary?.has) return false;
    if (!charger?.secondary?.state) return false;
    if (!isNumberValue(charger?.secondary?.state)) return true;

    const toleranceSet = entities.charger?.secondary_info?.display_zero_tolerance ?? 0;
    return Number(charger.secondary.state) >= toleranceSet;
  };

  return html`<div class="circle-container charger" style=${circleTintStyle(config.entities.charger?.circle_tint)}>
    <div
      class="circle ${disableEntityClick ? "pointer-events-none" : ""}"
      @click=${(e: MouseEvent) => {
        main.onEntityClick(e, charger, charger.entity);
      }}
      @dblclick=${(e: MouseEvent) => {
        main.onEntityDoubleClick(e, charger, charger.entity);
      }}
      @pointerdown=${(e: PointerEvent) => {
        main.onEntityPointerDown(e, charger, charger.entity);
      }}
      @pointerup=${(e: PointerEvent) => {
        main.onEntityPointerUp(e);
      }}
      @pointercancel=${(e: PointerEvent) => {
        main.onEntityPointerUp(e);
      }}
      @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
        if (e.key === "Enter") {
          main.openDetails(e, charger, charger.entity, "tap");
        }
      }}
    >
      <ha-ripple .disabled=${disableEntityClick}></ha-ripple>
      ${shouldShowSecondary() ? generalSecondarySpan(main.hass, main, config, templatesObj, charger, "charger") : nothing}
      ${charger.icon !== " " ? html`<ha-icon id="charger-icon" .icon=${charger.icon}></ha-icon>` : nothing}
      ${main.energyMode && charger.energy !== null && charger.energy !== undefined
        ? html`<span class="charger">${displayEnergy(main.hass, config, charger.energy)}</span>`
        : entities.charger?.display_zero_state !== false || (charger.state.toBattery || 0) > 0
        ? html`<span class="charger">
            ${displayValue(main.hass, config, charger.state.toBattery, {
              watt_threshold: config.watt_threshold,
            })}
          </span>`
        : nothing}
    </div>
    <span class="label">${charger.name}</span>
  </div>`;
};
