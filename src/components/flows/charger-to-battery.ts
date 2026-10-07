import { PowerFlowCardPlusConfig } from "@/power-flow-card-plus-config";
import { showLine } from "@/utils/show-line";
import { html, svg, nothing } from "lit";
import { styleLine } from "@/utils/style-line";
import { type Flows } from "./index";
import { checkShouldShowDots } from "@/utils/check-should-show-dots";
import { checkHasRightIndividual } from "@/utils/compute-individual-position";

const chargerToBatteryDot = (config: PowerFlowCardPlusConfig, charger: Flows["charger"], newDur: Flows["newDur"]) => {
  if (!checkShouldShowDots(config) || !charger?.state?.toBattery) return nothing;

  return svg`<circle r="1.4" class="charger-to-battery" vector-effect="non-scaling-stroke">
      <animateMotion dur="${newDur.chargerToBattery}s" repeatCount="indefinite" calcMode="paced">
        <mpath xlink:href="#charger-battery" />
      </animateMotion>
    </circle>`;
};

type FlowChargerToBatteryFlows = Pick<Flows, "battery" | "charger" | "newDur"> & Partial<Pick<Flows, "individual">>;

/**
 * One-way line from the external charging source into the battery.
 *
 * This does not reuse the shared `.lines` overlay: that one is anchored above the
 * battery row and clips everything outside a narrow band (which is why the stock
 * lines fade out before reaching the battery circle). Both of our nodes sit *in*
 * the battery row, so the line gets its own container spanning exactly that row,
 * with `preserveAspectRatio="none"` so the coordinates map straight onto it.
 */
export const flowChargerToBattery = (config: PowerFlowCardPlusConfig, { battery, charger, newDur, individual }: FlowChargerToBatteryFlows) => {
  const shouldShow = !!charger?.has && !!battery?.has && showLine(config, charger.state.toBattery || 0);
  if (!shouldShow) return nothing;

  // With a device in the right-hand column the row has four slots instead of three,
  // and the battery no longer sits in the middle of the card.
  const fourColumns = checkHasRightIndividual(individual ?? []);

  return html`<div class="pfcp-charger-lines ${fourColumns ? "four-columns" : ""}">
    <svg viewBox="0 0 100 10" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" id="charger-battery-flow">
      <path
        id="charger-battery"
        class="charger ${styleLine(charger.state.toBattery || 0, config)}"
        d="M0,5 H100"
        vector-effect="non-scaling-stroke"
      ></path>
      ${chargerToBatteryDot(config, charger, newDur)}
    </svg>
  </div>`;
};
