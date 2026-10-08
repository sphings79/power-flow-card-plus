import { ActionConfig, HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { UnsubscribeFunc } from "home-assistant-js-websocket";
import { html, LitElement, nothing, PropertyValues, TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { batteryElement } from "@/components/battery";
import { flowElement } from "@/components/flows";
import { gridElement } from "@/components/grid";
import { homeElement } from "@/components/home";
import { individualLeftBottomElement } from "@/components/individual-left-bottom-element";
import { individualLeftTopElement } from "@/components/individual-left-top-element";
import { individualRightBottomElement } from "@/components/individual-right-bottom-element";
import { individualRightTopElement } from "@/components/individual-right-top-element";
import { dashboardLinkElement } from "@/components/misc/dashboard-link";
import { energyToggleElement } from "@/components/misc/energy-toggle";
import { nonFossilElement } from "@/components/non-fossil";
import { chargerElement } from "@/components/charger";
import { solarElement } from "@/components/solar";
import { subsElement } from "@/components/subs";
import { handleAction } from "@/ha/panels/lovelace/common/handle-action";
import { PowerFlowCardPlusConfig } from "@/power-flow-card-plus-config";
import { getBatteryInState, getBatteryOutState, getBatteryStateOfCharge } from "@/states/raw/battery";
import { getGridConsumptionState, getGridProductionState, getGridSecondaryState } from "@/states/raw/grid";
import { getHomeSecondaryState } from "@/states/raw/home";
import { getIndividualObject, IndividualObject } from "@/states/raw/individual/get-individual-object";
import { getNonFossilHas, getNonFossilHasPercentage, getNonFossilSecondaryState } from "@/states/raw/non-fossil";
import { getChargerSecondaryState, getChargerState } from "@/states/raw/charger";
import { getSolarSecondaryState, getSolarState } from "@/states/raw/solar";
import { getBatterySubs, getChargerSubs, getSolarSubs, SubEntity } from "@/states/raw/subs";
import { adjustZeroTolerance } from "@/states/tolerance/base";
import { doesEntityExist } from "@/states/utils/existence-entity";
import { getEntityState } from "@/states/utils/get-entity-state";
import { getEntityStateWatts } from "@/states/utils/get-entity-state-watts";
import { styles } from "@/style";
import { allDynamicStyles } from "@/style/all";
import { RenderTemplateResult, subscribeRenderTemplate } from "@/template/ha-websocket.js";
import { ActionConfigSet, GridObject, HomeSources, NewDur, TemplatesObj } from "@/type";
import { computeFieldIcon, computeFieldName } from "@/utils/compute-field-attributes";
import { computeFlowRate } from "@/utils/compute-flow-rate";
import { computePowerDistributionAfterSolarAndBattery } from "@/utils/compute-power-distribution";
import {
  checkHasBottomIndividual,
  checkHasRightIndividual,
  getBottomLeftIndividual,
  getBottomRightIndividual,
  getTopLeftIndividual,
  getTopRightIndividual,
} from "@/utils/compute-individual-position";
import { displayEnergy, displayValue } from "@/utils/display-value";
import { defaultValues, getDefaultConfig } from "@/utils/get-default-config";
import { registerCustomCard } from "@/utils/register-custom-card";
import { circleTintStyle, coerceNumber } from "@/utils/utils";
import { checkShouldShowDots } from "@/utils/check-should-show-dots";
import { IndividualSortMode, sortIndividualObjects } from "@/utils/sort-individual-objects";
import { productionColor, socColor, usageColor } from "@/utils/usage-color";
import { EnergyPeriod, PickerUnit, fetchEnergyTotals, pickerRange, periodRange } from "@/energy/energy-totals";
import { logError } from "@/logging";
import localize from "@/localize/localize";

const circleCircumference = 238.76104;

registerCustomCard({
  type: "power-flow-card-plus-mushroom",
  name: "Power Flow Card Plus (Mushroom)",
  description:
    "An extended version of the power flow card with richer options, advanced features and a few small UI enhancements. Inspired by the Energy Dashboard.",
});

@customElement("power-flow-card-plus-mushroom")
export class PowerFlowCardPlus extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config = {} as PowerFlowCardPlusConfig;

  @state() private _templateResults: Partial<Record<string, RenderTemplateResult>> = {};
  @state() private _unsubRenderTemplates?: Map<string, Promise<UnsubscribeFunc>> = new Map();
  @state() private _width = 0;
  /** Period totals per energy entity, keyed by entity id. */
  @state() private _energyTotals: Record<string, number> = {};
  /** True while the card shows energy instead of power. */
  @state() private _energyMode = false;
  /** Period chosen with the picker; null until the user touches it. */
  @state() private _pick: { unit: PickerUnit; offset: number } | null = null;
  private _energyRequestKey = "";
  private _energyTimer?: number;
  private readonly wideEnoughForFourIndividuals = 359;
  private _resizeObserver?: ResizeObserver;
  private _handleVisibilityChange = () => {
    if (typeof document !== "undefined" && document.visibilityState === "visible") {
      this.requestUpdate();
    }
  };

  @query("#battery-grid-flow") batteryGridFlow?: SVGSVGElement;
  @query("#battery-home-flow") batteryToHomeFlow?: SVGSVGElement;
  @query("#grid-home-flow") gridToHomeFlow?: SVGSVGElement;
  @query("#solar-battery-flow") solarToBatteryFlow?: SVGSVGElement;
  @query("#solar-grid-flow") solarToGridFlow?: SVGSVGElement;
  @query("#solar-home-flow") solarToHomeFlow?: SVGSVGElement;
  private _renderData?:
    | {
        entities: PowerFlowCardPlusConfig["entities"];
        grid: GridObject;
        solar: any;
        battery: any;
        charger: any;
        home: any;
        nonFossil: any;
        individualObjs: IndividualObject[];
        newDur: NewDur;
        templatesObj: TemplatesObj;
        homeBatteryCircumference: number;
        homeSolarCircumference: number;
        homeNonFossilCircumference: number;
        homeGridCircumference: number;
        homeUsageToDisplay: string;
        sortedIndividualObjects: IndividualObject[];
        overflowIndividualObjects: IndividualObject[];
        individualsOnRail: boolean;
        individualFieldLeftTop?: IndividualObject;
        individualFieldLeftBottom?: IndividualObject;
        individualFieldRightTop?: IndividualObject;
        individualFieldRightBottom?: IndividualObject;
      }
    | undefined;

  setConfig(config: PowerFlowCardPlusConfig): void {
    if ((config.entities as any).individual1 || (config.entities as any).individual2) {
      throw new Error("You are using an outdated configuration. Please update your configuration to the latest version.");
    }
    config = this._normalizeMultiEntityConfig(config);
    this._pick = null;
    if (config.energy_default === true) this._energyMode = true;
    if (!config.entities || (!config.entities?.battery?.entity && !config.entities?.grid?.entity && !config.entities?.solar?.entity)) {
      throw new Error("At least one entity for battery, grid or solar must be defined");
    }
    this._config = {
      ...config,
      kw_decimals: coerceNumber(config.kw_decimals, defaultValues.kilowattDecimals),
      min_flow_rate: coerceNumber(config.min_flow_rate, defaultValues.minFlowRate),
      max_flow_rate: coerceNumber(config.max_flow_rate, defaultValues.maxFlowRate),
      w_decimals: coerceNumber(config.w_decimals, defaultValues.wattDecimals),
      watt_threshold: coerceNumber(config.watt_threshold, defaultValues.wattThreshold),
      max_expected_power: coerceNumber(config.max_expected_power, defaultValues.maxExpectedPower),
      min_expected_power: coerceNumber(config.min_expected_power, defaultValues.minExpectedPower),
      display_zero_lines: {
        mode: config.display_zero_lines?.mode ?? defaultValues.displayZeroLines.mode,
        transparency: coerceNumber(config.display_zero_lines?.transparency, defaultValues.displayZeroLines.transparency),
        grey_color: config.display_zero_lines?.grey_color ?? defaultValues.displayZeroLines.grey_color,
      },
    };
  }

  /**
   * Support multiple batteries and multiple PV sources. When a `sources` (solar) or
   * `batteries` (battery) list is provided but no aggregate `entity`, synthesize a
   * pipe-joined entity string so that the existing power-summing logic
   * (getEntityState splits on "|" and sums) transparently aggregates them into the
   * main node. The per-unit entities are still available for the docked breakdown.
   */
  private _normalizeMultiEntityConfig(config: PowerFlowCardPlusConfig): PowerFlowCardPlusConfig {
    if (!config.entities) return config;
    const entities = { ...config.entities };

    const solar = entities.solar;
    if (solar?.sources?.length && !solar.entity) {
      const joined = solar.sources
        .map((s) => s?.entity)
        .filter((e): e is string => typeof e === "string" && e.length > 0)
        .join(" | ");
      if (joined) entities.solar = { ...solar, entity: joined };
    }

    const battery = entities.battery;
    if (battery?.batteries?.length && !battery.entity) {
      const joined = battery.batteries
        .map((b) => b?.entity)
        .filter((e): e is string => typeof e === "string" && e.length > 0)
        .join(" | ");
      if (joined) entities.battery = { ...battery, entity: joined };
    }

    const charger = entities.charger;
    if (charger?.sources?.length && !charger.entity) {
      const joined = charger.sources
        .map((c) => c?.entity)
        .filter((e): e is string => typeof e === "string" && e.length > 0)
        .join(" | ");
      if (joined) entities.charger = { ...charger, entity: joined };
    }

    return { ...config, entities };
  }

  /** Energy entities that need a period total derived from statistics. */
  private _statisticEnergyIds(): string[] {
    const e = this._config?.entities;
    if (!e) return [];
    const ids: string[] = [];
    const add = (id?: string, fromState?: boolean) => {
      if (id && !fromState) ids.push(id);
    };

    add(e.grid?.energy_consumed_entity, e.grid?.energy_from_state);
    add(e.grid?.energy_returned_entity, e.grid?.energy_from_state);
    add(e.solar?.energy_entity, e.solar?.energy_from_state);
    add(e.home?.energy_entity, e.home?.energy_from_state);
    add(e.charger?.energy_entity, e.charger?.energy_from_state);
    add(e.battery?.energy_charged_entity, e.battery?.energy_from_state);
    add(e.battery?.energy_discharged_entity, e.battery?.energy_from_state);
    e.battery?.batteries?.forEach((b) => {
      add(b.energy_charged_entity, b.energy_from_state);
      add(b.energy_discharged_entity, b.energy_from_state);
    });
    e.solar?.sources?.forEach((s) => add(s.energy_entity, s.energy_from_state));
    e.charger?.sources?.forEach((s) => add(s.energy_entity, s.energy_from_state));
    e.individual?.forEach((i) => add(i.energy_entity, i.energy_from_state));

    return Array.from(new Set(ids));
  }

  private get _energyPeriod(): EnergyPeriod {
    return this._config?.energy_period ?? "today";
  }

  /** The picker's starting point, derived from `energy_period`. */
  private get _pickStart(): { unit: PickerUnit; offset: number } {
    switch (this._energyPeriod) {
      case "yesterday":
        return { unit: "day", offset: -1 };
      case "week":
      case "month":
      case "year":
        return { unit: this._energyPeriod, offset: 0 };
      default:
        return { unit: "day", offset: 0 };
    }
  }

  /** Unit and offset currently shown by the picker. */
  public get pickerState(): { unit: PickerUnit; offset: number } {
    return this._pick ?? this._pickStart;
  }

  /** First day of the week as `getDay()` numbering, following the user's HA profile. */
  private get _weekStart(): number {
    const names = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const setting = (this.hass?.locale as any)?.first_weekday as string | undefined;
    const named = setting ? names.indexOf(setting) : -1;
    if (named >= 0) return named;
    try {
      const lang = this.hass?.locale?.language ?? this.hass?.language ?? "en";
      const first = (new Intl.Locale(lang) as any).weekInfo?.firstDay ?? (new Intl.Locale(lang) as any).getWeekInfo?.().firstDay;
      if (typeof first === "number") return first % 7;
    } catch {
      /* fall through to Monday */
    }
    return 1;
  }

  /** Range the totals are loaded for: the picker's choice, or the configured period. */
  public get energyRange(): { start: Date; end: Date } {
    const now = new Date();
    if (this._pick) {
      const { unit, offset } = this.pickerState;
      return pickerRange(unit, offset, now, this._weekStart);
    }
    return periodRange(this._energyPeriod, now);
  }

  public setPickerUnit(unit: PickerUnit): void {
    this._pick = { unit, offset: 0 };
    this._refreshEnergyTotals();
  }

  public shiftPicker(delta: number): void {
    const { unit, offset } = this.pickerState;
    this._pick = { unit, offset: Math.min(0, offset + delta) };
    this._refreshEnergyTotals();
  }

  public resetPicker(): void {
    this._pick = { unit: this.pickerState.unit, offset: 0 };
    this._refreshEnergyTotals();
  }

  /**
   * Loads the period totals. Deliberately keyed on period plus entity list so a
   * plain state update does not trigger a fresh statistics query on every tick.
   */
  private async _refreshEnergyTotals(force = false): Promise<void> {
    if (!this.hass) return;
    const ids = this._statisticEnergyIds();
    if (!ids.length) return;

    // The picker's choice moves the range without touching the config, and a
    // range that ends now moves on every call, so key on the choice rather than
    // on timestamps.
    const pick = this.pickerState;
    const key = `${this._energyPeriod}|${this._pick ? `${pick.unit}:${pick.offset}` : ""}|${ids.join(",")}`;
    if (!force && key === this._energyRequestKey) return;
    this._energyRequestKey = key;

    try {
      this._energyTotals = await fetchEnergyTotals(this.hass, ids, this.energyRange);
    } catch (err) {
      // Clear the key so the next update retries instead of being suppressed by
      // the de-duplication guard.
      this._energyRequestKey = "";
      // A core without the statistics websocket API, or an entity without
      // statistics, should not take the whole card down.
      logError(`could not load energy statistics: ${err}`);
    }
  }

  /** True while the card shows energy instead of power. */
  public get energyMode(): boolean {
    return this._energyMode;
  }

  public setEnergyMode(on: boolean): void {
    this._energyMode = on;
    if (on) this._refreshEnergyTotals();
  }

  /** Whether anything is configured that the energy mode could show. */
  public get hasEnergyConfigured(): boolean {
    const e = this._config?.entities;
    if (!e) return false;
    return Boolean(
      e.grid?.energy_consumed_entity ||
      e.grid?.energy_returned_entity ||
      e.solar?.energy_entity ||
      e.home?.energy_entity ||
      e.charger?.energy_entity ||
      e.battery?.energy_charged_entity ||
      e.battery?.energy_discharged_entity ||
      e.battery?.batteries?.some((b) => b.energy_charged_entity || b.energy_discharged_entity) ||
      e.solar?.sources?.some((s) => s.energy_entity) ||
      e.charger?.sources?.some((s) => s.energy_entity) ||
      e.individual?.some((i) => i.energy_entity)
    );
  }

  /** Period energy for one entity, or null when it is not available. */
  public energyValue(entityId?: string, fromState?: boolean): number | null {
    if (!entityId) return null;
    if (fromState) {
      const raw = this.hass?.states?.[entityId]?.state;
      const num = Number(raw);
      return Number.isFinite(num) ? num : null;
    }
    const value = this._energyTotals[entityId];
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }

  public connectedCallback() {
    super.connectedCallback();
    // `hass` is usually not assigned yet at this point, so this first attempt
    // often bails out; `updated()` picks it up as soon as it arrives.
    this._refreshEnergyTotals();
    // Statistics only change once an hour, so a slow refresh is plenty.
    this._energyTimer = window.setInterval(() => this._refreshEnergyTotals(true), 5 * 60 * 1000);
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this._handleVisibilityChange);
    }
    this._tryConnectAll();
  }

  public disconnectedCallback() {
    if (this._energyTimer) {
      window.clearInterval(this._energyTimer);
      this._energyTimer = undefined;
    }
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this._handleVisibilityChange);
    }
    this._tryDisconnectAll();
    super.disconnectedCallback();
  }

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./ui-editor/ui-editor");
    return document.createElement("power-flow-card-plus-mushroom-editor");
  }

  public static getStubConfig(hass: HomeAssistant): object {
    // get available power entities
    return getDefaultConfig(hass);
  }

  public getCardSize(): Promise<number> | number {
    return 3;
  }

  private previousDur: { [name: string]: number } = {};
  private _pendingTapTimeouts = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();
  private _holdTimeouts = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();
  private _holdTriggered = new WeakMap<HTMLElement, boolean>();
  private readonly _doubleTapDelay = 250;
  private readonly _holdDelay = 500;

  private _normalizeActionConfig(config?: ActionConfig | ActionConfigSet): ActionConfigSet | undefined {
    if (!config) return undefined;
    if ("tap_action" in config || "hold_action" in config || "double_tap_action" in config) {
      return config as ActionConfigSet;
    }
    return {
      tap_action: {
        action: "more-info",
      } as ActionConfig,
    };
  }

  public openDetails(
    event: { stopPropagation: () => void; key?: string; target: HTMLElement },
    config?: ActionConfig | ActionConfigSet,
    entityId?: string | undefined,
    action: "tap" | "hold" | "double_tap" = "tap"
  ): void {
    event.stopPropagation();
    const normalizedConfig = this._normalizeActionConfig(config);
    const hasAnyAction = !!(normalizedConfig?.tap_action || normalizedConfig?.hold_action || normalizedConfig?.double_tap_action);

    if (!hasAnyAction) {
      if (!entityId || !this._config.clickable_entities) return;
      if (!doesEntityExist(this.hass, entityId)) return;
      const e = new CustomEvent("hass-more-info", {
        composed: true,
        detail: { entityId },
      });
      this.dispatchEvent(e);
      return;
    }

    handleAction(
      event.target,
      this.hass!,
      {
        entity: entityId,
        tap_action: normalizedConfig?.tap_action,
        hold_action: normalizedConfig?.hold_action,
        double_tap_action: normalizedConfig?.double_tap_action,
      },
      action
    );
  }

  public onEntityClick(event: MouseEvent, config?: ActionConfig | ActionConfigSet, entityId?: string): void {
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement | null;
    const normalizedConfig = this._normalizeActionConfig(config);
    if (!target) return;
    if (this._holdTriggered.get(target)) {
      this._holdTriggered.set(target, false);
      return;
    }
    if (normalizedConfig?.double_tap_action) {
      const existing = this._pendingTapTimeouts.get(target);
      if (existing) clearTimeout(existing);
      const timeout = setTimeout(() => {
        this.openDetails({ stopPropagation: () => event.stopPropagation(), target }, normalizedConfig, entityId, "tap");
        this._pendingTapTimeouts.delete(target);
      }, this._doubleTapDelay);
      this._pendingTapTimeouts.set(target, timeout);
      return;
    }
    this.openDetails({ stopPropagation: () => event.stopPropagation(), target }, normalizedConfig, entityId, "tap");
  }

  public onEntityDoubleClick(event: MouseEvent, config?: ActionConfig | ActionConfigSet, entityId?: string): void {
    const target = event.currentTarget as HTMLElement | null;
    const normalizedConfig = this._normalizeActionConfig(config);
    if (!target) return;
    const existing = this._pendingTapTimeouts.get(target);
    if (existing) {
      clearTimeout(existing);
      this._pendingTapTimeouts.delete(target);
    }
    if (!normalizedConfig?.double_tap_action) return;
    this.openDetails({ stopPropagation: () => event.stopPropagation(), target }, normalizedConfig, entityId, "double_tap");
  }

  public onEntityPointerDown(event: PointerEvent, config?: ActionConfig | ActionConfigSet, entityId?: string): void {
    const target = event.currentTarget as HTMLElement | null;
    const normalizedConfig = this._normalizeActionConfig(config);
    if (!target || !normalizedConfig?.hold_action) return;
    const existing = this._holdTimeouts.get(target);
    if (existing) clearTimeout(existing);
    this._holdTriggered.set(target, false);
    const timeout = setTimeout(() => {
      this._holdTriggered.set(target, true);
      this.openDetails({ stopPropagation: () => event.stopPropagation(), target }, normalizedConfig, entityId, "hold");
      this._holdTimeouts.delete(target);
    }, this._holdDelay);
    this._holdTimeouts.set(target, timeout);
  }

  public onEntityPointerUp(event: PointerEvent): void {
    const target = event.currentTarget as HTMLElement | null;
    if (!target) return;
    const holdTimeout = this._holdTimeouts.get(target);
    if (holdTimeout) {
      clearTimeout(holdTimeout);
      this._holdTimeouts.delete(target);
    }
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this._config || !this.hass) {
      return nothing;
    }
    const data = this._renderData ?? this._computeRenderData();
    const {
      entities,
      grid,
      solar,
      battery,
      charger,
      home,
      nonFossil,
      individualObjs,
      newDur,
      templatesObj,
      homeBatteryCircumference,
      homeGridCircumference,
      homeNonFossilCircumference,
      homeSolarCircumference,
      homeUsageToDisplay,
      overflowIndividualObjects,
      individualsOnRail,
      individualFieldLeftTop,
      individualFieldLeftBottom,
      individualFieldRightTop,
      individualFieldRightBottom,
    } = data;
    // Individual devices may be tinted by how much they currently draw, so a
    // glance at the list shows which one is the expensive device right now.
    const colorByUsage = this._config.color_individual_by_usage === true;
    const usageMax = this._config.individual_color_max ?? this._config.max_expected_power;
    const toSubEntity = (i: IndividualObject): SubEntity => {
      const explicit = typeof i.color === "string" ? i.color : undefined;
      const cfg = this._config.entities.individual?.find((c) => c.entity === i.entity);
      return {
        entity: i.entity,
        name: i.name,
        icon: i.icon,
        color: explicit ?? (colorByUsage ? usageColor(i.state ?? 0, usageMax) || undefined : undefined),
        state: i.state ?? 0,
        display: getIndividualDisplayState(i),
        energy: this.energyValue(cfg?.energy_entity, cfg?.energy_from_state),
      };
    };
    const getIndividualDisplayState = (field?: IndividualObject) => {
      if (!field) return "";
      if (field?.state === undefined) return "";
      return displayValue(this.hass, this._config, field?.state, {
        decimals: field?.decimals,
        unit: field?.unit,
        unitWhiteSpace: field?.unit_white_space,
        watt_threshold: this._config.watt_threshold,
      });
    };

    // Each breakdown list can be parked in any of the four zones around the
    // diagram; `individual` additionally supports `grid`, where the devices keep
    // their circles instead of being listed at all.
    const groups: { kind: "solar" | "battery" | "charger" | "individual"; where: string; items: SubEntity[]; title?: string; showSoc?: boolean }[] = [
      { kind: "solar", where: this._config.solar_position ?? "top", items: solar.subs ?? [], title: solar.name },
      { kind: "battery", where: this._config.battery_position ?? "bottom", items: battery.subs ?? [], title: battery.name, showSoc: true },
      { kind: "charger", where: this._config.charger_position ?? "bottom", items: charger.subs ?? [], title: charger.name },
      {
        kind: "individual",
        where: individualsOnRail ? (this._config.individual_position as string) : "none",
        items: individualsOnRail ? (overflowIndividualObjects ?? []).map(toSubEntity) : [],
      },
    ];

    // A side zone narrows the diagram, so the content must be allowed past its
    // usual width cap.
    const hasSideZone = groups.some((g) => (g.where === "left" || g.where === "right") && g.items.length);

    // With `reserve_side_width` the side zones keep their space while empty. The
    // configured positions decide, not the current items, so nothing moves when
    // devices appear later.
    const configuredPositions: string[] = [
      this._config.solar_position ?? "top",
      this._config.battery_position ?? "bottom",
      this._config.charger_position ?? "bottom",
      this._config.individual_position ?? "grid",
    ];
    const reserveSide = (where: "left" | "right") => !!this._config.reserve_side_width && configuredPositions.includes(where);
    const reserveAny = reserveSide("left") || reserveSide("right");
    const maxWidth = Number(this._config.max_width) > 0 ? Number(this._config.max_width) : 0;

    const zone = (where: "top" | "bottom" | "left" | "right") => {
      const inZone = groups.filter((g) => g.where === where && g.items.length);
      if (!inZone.length) {
        return (where === "left" || where === "right") && reserveSide(where)
          ? html`<div class="pfcp-breakdown pfcp-zone-${where} pfcp-zone-reserved"></div>`
          : nothing;
      }
      return html`<div class="pfcp-breakdown pfcp-zone-${where}">
        ${inZone.map((g) => subsElement(this, this._config, { kind: g.kind, title: g.title, items: g.items, showSoc: g.showSoc }))}
      </div>`;
    };

    // Outline of the circles for the filled appearances: 0 turns it off, 1 to 4 draws
    // it in the node colour, anything else leaves the appearance's own default.
    const outlineRaw = this._config.circle_outline;
    const outline =
      outlineRaw === undefined || outlineRaw === null || `${outlineRaw}` === "" || !Number.isFinite(Number(outlineRaw))
        ? null
        : Math.min(4, Math.max(0, Number(outlineRaw)));

    const cardContentClasses = [
      "card-content",
      this._config.full_size && "full-size",
      this._config.no_labels && "no-labels",
      // Bubble builds on the Mushroom shapes and only restyles them.
      (this._config.appearance === "mushroom" || this._config.appearance === "bubble") && "appearance-mushroom",
      this._config.appearance === "bubble" && "appearance-bubble",
      (hasSideZone || reserveAny) && "has-side-zone",
      maxWidth && "has-max-width",
      outline === 0 && "no-circle-outline",
      outline !== null && outline > 0 && "has-circle-outline",
    ]
      .filter(Boolean)
      .join(" ");

    return html`
      <ha-card
        .header=${this._config.title}
        class="${this._config.full_size ? "full-size" : ""} ${this._config.appearance === "bubble" ? "appearance-bubble" : ""}"
        style=${this._config.style_ha_card ? this._config.style_ha_card : ""}
      >
        <div
          class=${cardContentClasses}
          id="power-flow-card-plus"
          style="${maxWidth ? `--pfcp-max-width: ${maxWidth}px;` : ""}${circleTintStyle(this._config.circle_tint)}${outline
            ? `--pfcp-circle-outline: ${outline}px;`
            : ""}${this._config.style_card_content ?? ""}"
        >
          ${zone("top")}
          <!--
            The flow diagram needs its own positioning context. The flow lines are
            absolutely positioned against the bottom of their offset parent, so any
            content added below them inside that parent (the docked breakdown) would
            push every line downwards by its own height.
          -->
          <div class="pfcp-layout">
            ${zone("left")}
            <div class="pfcp-flow">
              ${energyToggleElement(this, this._config, this.hasEnergyConfigured)}
              ${solar.has || individualObjs?.some((individual) => individual?.has) || nonFossil.hasPercentage
                ? html`<div class="row">
                    ${nonFossilElement(this, this._config, {
                      entities,
                      grid,
                      newDur,
                      nonFossil,
                      templatesObj,
                    })}
                    ${solar.has
                      ? solarElement(this, this._config, {
                          entities,
                          solar,
                          templatesObj,
                        })
                      : individualObjs?.some((individual) => individual?.has)
                        ? html`<div class="spacer"></div>`
                        : nothing}
                    ${individualFieldLeftTop
                      ? individualLeftTopElement(this, this._config, {
                          individualObj: individualFieldLeftTop,
                          displayState: getIndividualDisplayState(individualFieldLeftTop),
                          newDur,
                          templatesObj,
                        })
                      : html`<div class="spacer"></div>`}
                    ${checkHasRightIndividual(individualObjs)
                      ? individualRightTopElement(this, this._config, {
                          displayState: getIndividualDisplayState(individualFieldRightTop),
                          individualObj: individualFieldRightTop,
                          newDur,
                          templatesObj,
                          battery,
                          individualObjs,
                        })
                      : nothing}
                  </div>`
                : nothing}
              <div class="row">
                ${grid.has
                  ? gridElement(this, this._config, {
                      entities,
                      grid,
                      templatesObj,
                    })
                  : html`<div class="spacer"></div>`}
                <div class="spacer"></div>
                ${!entities.home?.hide
                  ? homeElement(this, this._config, {
                      circleCircumference,
                      entities,
                      grid,
                      home,
                      homeBatteryCircumference,
                      homeGridCircumference,
                      homeNonFossilCircumference,
                      homeSolarCircumference,
                      newDur,
                      templatesObj,
                      homeUsageToDisplay,
                      individual: individualObjs,
                    })
                  : html`<div class="spacer"></div>`}
                ${checkHasRightIndividual(individualObjs) ? html` <div class="spacer"></div>` : nothing}
              </div>
              ${battery.has || charger.has || checkHasBottomIndividual(individualObjs)
                ? html`<div class="row">
                    ${charger.has ? chargerElement(this, this._config, { charger, entities, templatesObj }) : html`<div class="spacer"></div>`}
                    ${battery.has ? batteryElement(this, this._config, { battery, entities }) : html`<div class="spacer"></div>`}
                    ${individualFieldLeftBottom
                      ? individualLeftBottomElement(this, this._config, {
                          displayState: getIndividualDisplayState(individualFieldLeftBottom),
                          individualObj: individualFieldLeftBottom,
                          newDur,
                          templatesObj,
                        })
                      : html`<div class="spacer"></div>`}
                    ${checkHasRightIndividual(individualObjs)
                      ? individualRightBottomElement(this, this._config, {
                          displayState: getIndividualDisplayState(individualFieldRightBottom),
                          individualObj: individualFieldRightBottom,
                          newDur,
                          templatesObj,
                        })
                      : nothing}
                  </div>`
                : html`<div class="spacer"></div>`}
              ${flowElement(this._config, {
                battery,
                grid,
                individual: individualObjs,
                newDur,
                solar,
                charger,
              })}
            </div>
            ${zone("right")}
          </div>
          ${zone("bottom")}
        </div>
        ${dashboardLinkElement(this._config, this.hass)}
      </ha-card>
    `;
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (!this._config || !this.hass) {
      return;
    }

    // The first load happens here rather than in connectedCallback: `hass` is
    // assigned after the element connects, so the call there finds nothing to
    // query. The de-duplication guard inside keeps this to one request.
    if (changedProps.has("hass") || changedProps.has("_config")) {
      this._refreshEnergyTotals();
    }

    const elem = this.shadowRoot?.querySelector("#power-flow-card-plus") as HTMLElement | null;
    if (elem) {
      if (!this._resizeObserver) {
        this._resizeObserver = new ResizeObserver((entries) => {
          const entry = entries[0];
          if (!entry) return;
          const width = Math.round(entry.contentRect.width);
          if (width !== this._width) {
            this._width = width;
          }
        });
      }
      this._resizeObserver.observe(elem);
      const width = Math.round(elem.getBoundingClientRect().width);
      if (width !== this._width) {
        this._width = width;
      }
    }

    this._layoutRightIndividualLines();
    this._tryConnectAll();
  }

  /**
   * Draws the flow lines of the two right-hand individual devices from the measured
   * positions of their circles and of the home circle.
   *
   * The geometry used to be a fixed 100x100 drawing scaled by percentages of the card,
   * which only lined up at one card width. Measuring the circles keeps the line
   * attached to them at any width, with any number of rows above or below.
   */
  private _layoutRightIndividualLines(): void {
    const root = this.shadowRoot;
    const flow = root?.querySelector(".pfcp-flow") as HTMLElement | null;
    const home = root?.querySelector(".circle-container.home .circle") as HTMLElement | null;
    if (!flow || !home) return;
    const fr = flow.getBoundingClientRect();
    const hr = home.getBoundingClientRect();
    if (!fr.width) return;

    const draw = (pos: "top" | "bottom", circleSelector: string, pathSelector: string) => {
      const path = root?.querySelector(pathSelector) as SVGPathElement | null;
      const circle = root?.querySelector(circleSelector) as HTMLElement | null;
      if (!path || !circle) return;
      const cr = circle.getBoundingClientRect();
      // Starts at the near edge of the device circle and ends on the right-hand rim of
      // the home circle, 20 degrees above (top device) or below (bottom device) its
      // centre line, so the two lines meet it at different points.
      const sx = cr.left + cr.width / 2 - fr.left;
      const sy = (pos === "top" ? cr.bottom : cr.top) - fr.top;
      const radius = hr.width / 2;
      const angle = (20 * Math.PI) / 180;
      const ex = hr.left + radius + radius * Math.cos(angle) - fr.left;
      const ey = hr.top + radius + (pos === "top" ? -1 : 1) * radius * Math.sin(angle) - fr.top;
      const dx = sx - ex;
      const dy = Math.abs(ey - sy);
      if (dx <= 0 || dy <= 0) {
        path.setAttribute("d", "");
        return;
      }
      const r = Math.min(30, dx, dy);
      const vertical = pos === "top" ? ey - r : ey + r;
      path.setAttribute("d", `M${sx},${sy} V${vertical} Q${sx},${ey} ${sx - r},${ey} H${ex}`);
    };

    draw("top", ".circle-container.individual-right-top .circle", "#individual-top-right-home");
    draw("bottom", ".circle-container.individual-right-bottom .circle", "#individual-bottom-right-home");
  }

  protected willUpdate(changedProps: PropertyValues): void {
    super.willUpdate(changedProps);
    if (!this._config || !this.hass) {
      return;
    }
    if (
      changedProps.has("hass") ||
      changedProps.has("_config") ||
      changedProps.has("_templateResults") ||
      changedProps.has("_width") ||
      // Statistics arrive asynchronously, so the cached render data has to be
      // rebuilt once they land — otherwise the lists keep their empty values.
      changedProps.has("_energyTotals") ||
      changedProps.has("_energyMode") ||
      this._renderData === undefined
    ) {
      this.style.setProperty("--clickable-cursor", this._config.clickable_entities ? "pointer" : "default");
      this._renderData = this._computeRenderData();
    }
  }

  private _computeRenderData() {
    const { entities } = this._config;
    const initialNumericState = null as null | number;
    const grid: GridObject = {
      entity: entities.grid?.entity,
      has: entities?.grid?.entity !== undefined,
      hasReturnToGrid: typeof entities.grid?.entity === "string" || !!entities.grid?.entity?.production,
      energy: {
        consumed: this.energyValue(entities.grid?.energy_consumed_entity, entities.grid?.energy_from_state),
        returned: this.energyValue(entities.grid?.energy_returned_entity, entities.grid?.energy_from_state),
      },
      state: {
        fromGrid: getGridConsumptionState(this.hass, this._config),
        toGrid: getGridProductionState(this.hass, this._config),
        toBattery: initialNumericState,
        toHome: initialNumericState,
      },
      powerOutage: {
        has: entities.grid?.power_outage?.entity !== undefined,
        isOutage:
          (entities.grid && this.hass.states[entities.grid.power_outage?.entity]?.state) === (entities.grid?.power_outage?.state_alert ?? "on"),
        icon: entities.grid?.power_outage?.icon_alert || "mdi:transmission-tower-off",
        name: entities.grid?.power_outage?.label_alert ?? html`Power<br />Outage`,
        entityGenerator: entities.grid?.power_outage?.entity_generator,
      },
      icon: computeFieldIcon(this.hass, entities.grid, "mdi:transmission-tower"),
      name: computeFieldName(this.hass, entities.grid, this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.grid")),
      mainEntity:
        typeof entities.grid?.entity === "object" ? entities.grid.entity.consumption || entities.grid.entity.production : entities.grid?.entity,
      color: {
        fromGrid: entities.grid?.color?.consumption,
        toGrid: entities.grid?.color?.production,
        icon_type: entities.grid?.color_icon as "color_dynamically" | "no_color" | "production" | "consumption" | undefined,
        circle_type: entities.grid?.color_circle,
      },
      tap_action: entities.grid?.tap_action,
      hold_action: entities.grid?.hold_action,
      double_tap_action: entities.grid?.double_tap_action,
      secondary: {
        entity: entities.grid?.secondary_info?.entity,
        decimals: entities.grid?.secondary_info?.decimals,
        template: entities.grid?.secondary_info?.template,
        has: entities.grid?.secondary_info?.entity !== undefined,
        state: getGridSecondaryState(this.hass, this._config),
        icon: entities.grid?.secondary_info?.icon,
        unit: entities.grid?.secondary_info?.unit_of_measurement,
        unit_white_space: entities.grid?.secondary_info?.unit_white_space,
        accept_negative: entities.grid?.secondary_info?.accept_negative || false,
        color: {
          type: entities.grid?.secondary_info?.color_value,
        },
        tap_action: entities.grid?.secondary_info?.tap_action,
        hold_action: entities.grid?.secondary_info?.hold_action,
        double_tap_action: entities.grid?.secondary_info?.double_tap_action,
      },
    };
    const hasSolarEntity = entities.solar?.entity !== undefined;
    const isProducingSolar = (getSolarState(this.hass, this._config) ?? 0) > 0;
    const displayZero = entities.solar?.display_zero !== false || isProducingSolar;
    const solar = {
      entity: entities.solar?.entity as string | undefined,
      has: hasSolarEntity && displayZero,
      subs: getSolarSubs(this.hass, this._config).map((sub, index) => {
        const source = entities.solar?.sources?.[index];
        const withEnergy = {
          ...sub,
          energy: this.energyValue(source?.energy_entity, source?.energy_from_state),
        };
        // Each array is judged against its own peak power, so a small balcony
        // unit at full tilt reads as green just like a large roof array does.
        if (this._config.color_solar_by_output !== true) return withEnergy;
        const max = source?.color_max ?? this._config.solar_color_max ?? this._config.max_expected_power;
        const tint = productionColor(withEnergy.state ?? 0, max) || undefined;
        return {
          ...withEnergy,
          // An explicit colour still wins for the row accent, but the reading
          // itself always follows the output so the number stays comparable.
          color: withEnergy.color ?? tint,
          stateColor: tint,
        };
      }),
      energy: this.energyValue(entities.solar?.energy_entity, entities.solar?.energy_from_state),
      state: {
        total: getSolarState(this.hass, this._config),
        toHome: initialNumericState,
        toGrid: initialNumericState,
        toBattery: initialNumericState,
      },
      icon: computeFieldIcon(this.hass, entities.solar, "mdi:solar-power"),
      name: computeFieldName(this.hass, entities.solar, this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.solar")),
      tap_action: entities.solar?.tap_action,
      hold_action: entities.solar?.hold_action,
      double_tap_action: entities.solar?.double_tap_action,
      secondary: {
        entity: entities.solar?.secondary_info?.entity,
        decimals: entities.solar?.secondary_info?.decimals,
        template: entities.solar?.secondary_info?.template,
        has: entities.solar?.secondary_info?.entity !== undefined,
        accept_negative: entities.solar?.secondary_info?.accept_negative || false,
        state: getSolarSecondaryState(this.hass, this._config),
        icon: entities.solar?.secondary_info?.icon,
        unit: entities.solar?.secondary_info?.unit_of_measurement,
        unit_white_space: entities.solar?.secondary_info?.unit_white_space,
        tap_action: entities.solar?.secondary_info?.tap_action,
        hold_action: entities.solar?.secondary_info?.hold_action,
        double_tap_action: entities.solar?.secondary_info?.double_tap_action,
      },
    };
    const checkIfHasBattery = () => {
      if (!entities.battery?.entity) return false;
      if (typeof entities.battery?.entity === "object") return entities.battery?.entity.consumption || entities.battery?.entity.production;
      return entities.battery?.entity !== undefined;
    };
    const battery = {
      entity: entities.battery?.entity,
      has: checkIfHasBattery(),
      subs: getBatterySubs(this.hass, this._config).map((sub, index) => {
        const unit = entities.battery?.batteries?.[index];
        // Discharge shows up as a negative reading, the same way the row displays
        // it; charging counts as no discharge and therefore stays green.
        const dischargeMax = unit?.discharge_color_max ?? this._config.battery_discharge_max ?? this._config.max_expected_power;
        const withEnergy = {
          ...sub,
          energyCharged: this.energyValue(unit?.energy_charged_entity, unit?.energy_from_state),
          energyDischarged: this.energyValue(unit?.energy_discharged_entity, unit?.energy_from_state),
          stateColor:
            this._config.color_battery_by_discharge === true ? usageColor(Math.max(0, -(sub.state ?? 0)), dischargeMax) || undefined : undefined,
        };
        // Tint by state of charge, unless the battery carries an explicit colour.
        return this._config.color_battery_by_soc === true && withEnergy.color === undefined && withEnergy.soc !== null && withEnergy.soc !== undefined
          ? { ...withEnergy, color: socColor(Number(withEnergy.soc)) || undefined }
          : withEnergy;
      }),
      mainEntity: typeof entities.battery?.entity === "object" ? entities.battery.entity.consumption : entities.battery?.entity,
      name: computeFieldName(this.hass, entities.battery, this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.battery")),
      icon: computeFieldIcon(this.hass, entities.battery, "mdi:battery-high"),
      energy: {
        charged: this.energyValue(entities.battery?.energy_charged_entity, entities.battery?.energy_from_state),
        discharged: this.energyValue(entities.battery?.energy_discharged_entity, entities.battery?.energy_from_state),
      },
      state_of_charge: {
        state: getBatteryStateOfCharge(this.hass, this._config),
        unit: entities?.battery?.state_of_charge_unit ?? "%",
        unit_white_space: entities?.battery?.state_of_charge_unit_white_space ?? true,
        decimals: entities?.battery?.state_of_charge_decimals || 0,
      },
      state: {
        toBattery: getBatteryInState(this.hass, this._config),
        fromBattery: getBatteryOutState(this.hass, this._config),
        toGrid: 0,
        toHome: 0,
      },
      tap_action: entities.battery?.tap_action,
      hold_action: entities.battery?.hold_action,
      double_tap_action: entities.battery?.double_tap_action,
      color: {
        fromBattery: entities.battery?.color?.consumption,
        toBattery: entities.battery?.color?.production,
        icon_type: undefined as string | boolean | undefined,
        circle_type: entities.battery?.color_circle,
      },
    };
    const chargerState = getChargerState(this.hass, this._config) ?? 0;
    const chargerTolerance = entities.charger?.display_zero_tolerance ?? 0;
    const chargerIsActive = chargerState > chargerTolerance;
    const charger = {
      entity: entities.charger?.entity,
      // Needs a battery to flow into — on its own the node would have nowhere to point.
      has: entities.charger?.entity !== undefined && checkIfHasBattery() && (entities.charger?.display_zero !== false || chargerIsActive),
      energy: this.energyValue(entities.charger?.energy_entity, entities.charger?.energy_from_state),
      // A single source repeats the node's own value, so it is not listed by default.
      subs:
        (entities.charger?.show_breakdown ?? (entities.charger?.sources?.length ?? 0) > 1)
          ? getChargerSubs(this.hass, this._config).map((sub, index) => {
              const source = entities.charger?.sources?.[index];
              return { ...sub, energy: this.energyValue(source?.energy_entity, source?.energy_from_state) };
            })
          : [],
      name: computeFieldName(this.hass, entities.charger, localize("editor.charger")),
      icon: computeFieldIcon(this.hass, entities.charger, "mdi:ev-station"),
      state: {
        toBattery: chargerIsActive ? chargerState : 0,
      },
      tap_action: entities.charger?.tap_action,
      hold_action: entities.charger?.hold_action,
      double_tap_action: entities.charger?.double_tap_action,
      secondary: {
        entity: entities.charger?.secondary_info?.entity,
        decimals: entities.charger?.secondary_info?.decimals,
        template: entities.charger?.secondary_info?.template,
        has: entities.charger?.secondary_info?.entity !== undefined,
        accept_negative: entities.charger?.secondary_info?.accept_negative || false,
        state: getChargerSecondaryState(this.hass, this._config),
        icon: entities.charger?.secondary_info?.icon,
        unit: entities.charger?.secondary_info?.unit_of_measurement,
        unit_white_space: entities.charger?.secondary_info?.unit_white_space,
      },
    };
    const home = {
      entity: entities.home?.entity,
      has: entities?.home?.entity !== undefined,
      energy: this.energyValue(entities.home?.energy_entity, entities.home?.energy_from_state),
      state: initialNumericState,
      icon: computeFieldIcon(this.hass, entities?.home, "mdi:home"),
      name: computeFieldName(this.hass, entities?.home, this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.home")),
      tap_action: entities.home?.tap_action,
      hold_action: entities.home?.hold_action,
      double_tap_action: entities.home?.double_tap_action,
      secondary: {
        entity: entities.home?.secondary_info?.entity,
        template: entities.home?.secondary_info?.template,
        has: entities.home?.secondary_info?.entity !== undefined,
        state: getHomeSecondaryState(this.hass, this._config),
        accept_negative: entities.home?.secondary_info?.accept_negative || false,
        unit: entities.home?.secondary_info?.unit_of_measurement,
        unit_white_space: entities.home?.secondary_info?.unit_white_space,
        icon: entities.home?.secondary_info?.icon,
        decimals: entities.home?.secondary_info?.decimals,
        tap_action: entities.home?.secondary_info?.tap_action,
        hold_action: entities.home?.secondary_info?.hold_action,
        double_tap_action: entities.home?.secondary_info?.double_tap_action,
      },
    };
    const individualObjs: IndividualObject[] = entities.individual?.map((individual) => getIndividualObject(this.hass, individual)) || [];
    const nonFossil = {
      entity: entities.fossil_fuel_percentage?.entity,
      name: computeFieldName(this.hass, entities.fossil_fuel_percentage, this.hass.localize("card.label.non_fossil_fuel_percentage")),
      icon: computeFieldIcon(this.hass, entities.fossil_fuel_percentage, "mdi:leaf"),
      has: getNonFossilHas(this.hass, this._config),
      hasPercentage: getNonFossilHasPercentage(this.hass, this._config),
      state: {
        power: initialNumericState,
      },
      color: entities.fossil_fuel_percentage?.color,
      color_value: entities.fossil_fuel_percentage?.color_value,
      tap_action: entities.fossil_fuel_percentage?.tap_action,
      hold_action: entities.fossil_fuel_percentage?.hold_action,
      double_tap_action: entities.fossil_fuel_percentage?.double_tap_action,
      secondary: {
        entity: entities.fossil_fuel_percentage?.secondary_info?.entity,
        decimals: entities.fossil_fuel_percentage?.secondary_info?.decimals,
        template: entities.fossil_fuel_percentage?.secondary_info?.template,
        has: entities.fossil_fuel_percentage?.secondary_info?.entity !== undefined,
        state: getNonFossilSecondaryState(this.hass, this._config),
        accept_negative: entities.fossil_fuel_percentage?.secondary_info?.accept_negative || false,
        icon: entities.fossil_fuel_percentage?.secondary_info?.icon,
        unit: entities.fossil_fuel_percentage?.secondary_info?.unit_of_measurement,
        unit_white_space: entities.fossil_fuel_percentage?.secondary_info?.unit_white_space,
        color_value: entities.fossil_fuel_percentage?.secondary_info?.color_value,
        tap_action: entities.fossil_fuel_percentage?.secondary_info?.tap_action,
        hold_action: entities.fossil_fuel_percentage?.secondary_info?.hold_action,
        double_tap_action: entities.fossil_fuel_percentage?.secondary_info?.double_tap_action,
      },
    };
    grid.state.fromGrid = adjustZeroTolerance(grid.state.fromGrid, entities.grid?.display_zero_tolerance);
    grid.state.toGrid = adjustZeroTolerance(grid.state.toGrid, entities.grid?.display_zero_tolerance);
    solar.state.total = adjustZeroTolerance(solar.state.total, entities.solar?.display_zero_tolerance);
    battery.state.fromBattery = adjustZeroTolerance(battery.state.fromBattery, entities.battery?.display_zero_tolerance);
    battery.state.toBattery = adjustZeroTolerance(battery.state.toBattery, entities.battery?.display_zero_tolerance);
    if (grid.state.fromGrid === 0) {
      grid.state.toHome = 0;
      grid.state.toBattery = 0;
    }
    if (solar.state.total === 0) {
      solar.state.toGrid = 0;
      solar.state.toBattery = 0;
      solar.state.toHome = 0;
    }
    if (battery.state.fromBattery === 0) {
      battery.state.toGrid = 0;
      battery.state.toHome = 0;
    }
    computePowerDistributionAfterSolarAndBattery({
      entities: {
        grid: entities.grid,
        battery: entities.battery,
        solar: entities.solar,
        fossil_fuel_percentage: entities.fossil_fuel_percentage,
      },
      grid,
      solar,
      battery,
      nonFossil,
      getEntityStateWatts: (entityId) => getEntityStateWatts(this.hass, entityId),
      getEntityState: (entityId) => getEntityState(this.hass, entityId),
      chargerToBattery: charger.has ? charger.state.toBattery : 0,
    });
    const totalIndividualConsumption = individualObjs?.reduce((a, b) => a + (b.has ? b.state || 0 : 0), 0) || 0;
    const totalHomeConsumption = Math.max((grid.state.toHome ?? 0) + (solar.state.toHome ?? 0) + (battery.state.toHome ?? 0), 0);
    const homeBatteryCircumference = battery.state.toHome ? circleCircumference * (battery.state.toHome / totalHomeConsumption) : 0;
    const homeSolarCircumference = solar.state.toHome ? circleCircumference * (solar.state.toHome / totalHomeConsumption) : 0;
    const homeNonFossilCircumference = nonFossil.state.power ? circleCircumference * (nonFossil.state.power / totalHomeConsumption) : 0;
    const homeGridCircumference =
      circleCircumference *
      ((totalHomeConsumption - (nonFossil.state.power ?? 0) - (battery.state.toHome ?? 0) - (solar.state.toHome ?? 0)) / totalHomeConsumption);
    const homeEnergy = this.energyValue(entities.home?.energy_entity, entities.home?.energy_from_state);
    const homeUsageToDisplay =
      this._energyMode && homeEnergy !== null
        ? displayEnergy(this.hass, this._config, homeEnergy)
        : entities.home?.override_state && entities.home.entity
          ? entities.home?.subtract_individual
            ? displayValue(this.hass, this._config, getEntityStateWatts(this.hass, entities.home.entity) - totalIndividualConsumption, {
                unit: entities.home?.unit_of_measurement,
                unitWhiteSpace: entities.home?.unit_white_space,
                watt_threshold: this._config.watt_threshold,
              })
            : displayValue(this.hass, this._config, getEntityStateWatts(this.hass, entities.home.entity), {
                unit: entities.home?.unit_of_measurement,
                unitWhiteSpace: entities.home?.unit_white_space,
                watt_threshold: this._config.watt_threshold,
              })
          : entities.home?.subtract_individual
            ? displayValue(this.hass, this._config, totalHomeConsumption - totalIndividualConsumption || 0, {
                unit: entities.home?.unit_of_measurement,
                unitWhiteSpace: entities.home?.unit_white_space,
                watt_threshold: this._config.watt_threshold,
              })
            : displayValue(this.hass, this._config, totalHomeConsumption, {
                unit: entities.home?.unit_of_measurement,
                unitWhiteSpace: entities.home?.unit_white_space,
                watt_threshold: this._config.watt_threshold,
              });
    const totalLines =
      (grid.state.toHome ?? 0) +
      (solar.state.toHome ?? 0) +
      (solar.state.toGrid ?? 0) +
      (solar.state.toBattery ?? 0) +
      (battery.state.toHome ?? 0) +
      (grid.state.toBattery ?? 0) +
      (battery.state.toGrid ?? 0);
    if (battery.state_of_charge.state === null) {
      battery.icon = "mdi:battery";
    } else if (battery.state_of_charge.state <= 72 && battery.state_of_charge.state > 44) {
      battery.icon = "mdi:battery-medium";
    } else if (battery.state_of_charge.state <= 44 && battery.state_of_charge.state > 16) {
      battery.icon = "mdi:battery-low";
    } else if (battery.state_of_charge.state <= 16) {
      battery.icon = "mdi:battery-outline";
    }
    if (entities.battery?.icon !== undefined) battery.icon = entities.battery?.icon;
    const batteryUseMetadataIcon = entities.battery?.use_metadata;
    if (batteryUseMetadataIcon) {
      const metadataIcon = computeFieldIcon(this.hass, entities.battery, "NO_ICON_METADATA");
      if (metadataIcon !== "NO_ICON_METADATA") {
        battery.icon = metadataIcon;
      }
    }
    const newDur: NewDur = {
      batteryGrid: computeFlowRate(this._config, Math.max(grid.state.toBattery ?? 0, battery.state.toGrid ?? 0, 0), totalLines),
      batteryToHome: computeFlowRate(this._config, battery.state.toHome ?? 0, totalLines),
      gridToHome: computeFlowRate(this._config, grid.state.toHome ?? 0, totalLines),
      solarToBattery: computeFlowRate(this._config, solar.state.toBattery ?? 0, totalLines),
      solarToGrid: computeFlowRate(this._config, solar.state.toGrid ?? 0, totalLines),
      solarToHome: computeFlowRate(this._config, solar.state.toHome ?? 0, totalLines),
      chargerToBattery: computeFlowRate(this._config, charger.state.toBattery ?? 0, totalLines),
      individual: individualObjs?.map((individual) => computeFlowRate(this._config, individual.state ?? 0, totalIndividualConsumption)) || [],
      nonFossil: computeFlowRate(this._config, nonFossil.state.power ?? 0, totalLines),
    };
    if (checkShouldShowDots(this._config)) {
      ["batteryGrid", "batteryToHome", "gridToHome", "solarToBattery", "solarToGrid", "solarToHome"].forEach((flowName) => {
        const flowSVGElement = this[`${flowName}Flow`] as SVGSVGElement;
        if (flowSVGElement && this.previousDur[flowName] && this.previousDur[flowName] !== newDur[flowName]) {
          flowSVGElement.pauseAnimations();
          flowSVGElement.setCurrentTime(flowSVGElement.getCurrentTime() * (newDur[flowName] / this.previousDur[flowName]));
          flowSVGElement.unpauseAnimations();
        }
        this.previousDur[flowName] = newDur[flowName];
      });
    } else {
      this.previousDur = {};
    }
    const homeSources: HomeSources = {
      battery: {
        value: homeBatteryCircumference,
        color: "var(--energy-battery-out-color)",
      },
      solar: {
        value: homeSolarCircumference,
        color: "var(--energy-solar-color)",
      },
      grid: {
        value: homeGridCircumference,
        color: "var(--energy-grid-consumption-color)",
      },
      gridNonFossil: {
        value: homeNonFossilCircumference,
        color: "var(--energy-non-fossil-color)",
      },
    };
    const homeLargestSource = Object.keys(homeSources).reduce((a, b) => (homeSources[a].value > homeSources[b].value ? a : b));
    const individualKeys = ["left-top", "left-bottom", "right-top", "right-bottom"];
    const templatesObj: TemplatesObj = {
      gridSecondary: this._templateResults.gridSecondary?.result,
      solarSecondary: this._templateResults.solarSecondary?.result,
      homeSecondary: this._templateResults.homeSecondary?.result,
      nonFossilFuelSecondary: this._templateResults.nonFossilFuelSecondary?.result,
      individual: individualObjs?.map((_, index) => this._templateResults[`${individualKeys[index]}Secondary`]?.result) || [],
    };

    const isCardWideEnough = this._width > 420;
    const sortSetting = this._config.sort_individual_devices;
    const sortMode: IndividualSortMode | null =
      sortSetting === true ? "value" : typeof sortSetting === "string" ? (sortSetting as IndividualSortMode) : null;
    const sortedIndividualObjects = sortMode ? sortIndividualObjects(individualObjs, sortMode) : individualObjs;
    // Any `individual_position` other than `grid` lists the devices in one of the
    // zones around the diagram instead of occupying corner slots, so none of them
    // go into the grid.
    const individualsOnRail = (this._config.individual_position ?? "grid") !== "grid";
    // How many individual devices may occupy the four corner slots of the flow diagram.
    // Physically capped at 4; user-configurable via `max_individual_in_grid` (0..4).
    const maxInGrid = individualsOnRail ? 0 : Math.max(0, Math.min(4, this._config.max_individual_in_grid ?? 4));
    const maxVisibleIndividuals = this._config.allow_layout_break
      ? maxInGrid
      : this._width >= this.wideEnoughForFourIndividuals
        ? maxInGrid
        : Math.min(2, maxInGrid);

    const filteredNotShownIndividualObjects = sortedIndividualObjects.filter((individual) => individual.has);
    const visibleIndividualObjects = filteredNotShownIndividualObjects.slice(0, maxVisibleIndividuals);
    // Any individual devices beyond the corner slots are rendered in the docked list below the diagram.
    const overflowIndividualObjects = filteredNotShownIndividualObjects.slice(maxVisibleIndividuals);

    const individualFieldLeftTop = getTopLeftIndividual(visibleIndividualObjects);
    const individualFieldLeftBottom = getBottomLeftIndividual(visibleIndividualObjects);
    const individualFieldRightTop = getTopRightIndividual(visibleIndividualObjects);
    const individualFieldRightBottom = getBottomRightIndividual(visibleIndividualObjects);

    allDynamicStyles(this, {
      grid,
      solar,
      battery,
      display_zero_lines_grey_color: this._config.display_zero_lines?.mode === "grey_out" ? this._config.display_zero_lines?.grey_color : "",
      display_zero_lines_transparency: this._config.display_zero_lines?.mode === "transparency" ? this._config.display_zero_lines?.transparency : "",
      entities,
      homeLargestSource,
      homeSources,
      individual: sortedIndividualObjects,
      nonFossil,
      isCardWideEnough,
    });
    return {
      entities,
      grid,
      solar,
      battery,
      charger,
      home,
      nonFossil,
      individualObjs: visibleIndividualObjects,
      newDur,
      templatesObj,
      homeBatteryCircumference,
      homeSolarCircumference,
      homeNonFossilCircumference,
      homeGridCircumference,
      homeUsageToDisplay,
      sortedIndividualObjects: visibleIndividualObjects,
      overflowIndividualObjects,
      individualsOnRail,
      individualFieldLeftTop,
      individualFieldLeftBottom,
      individualFieldRightTop,
      individualFieldRightBottom,
    };
  }

  private _tryConnectAll() {
    const { entities } = this._config;
    const templatesObj = {
      gridSecondary: entities.grid?.secondary_info?.template,
      solarSecondary: entities.solar?.secondary_info?.template,
      homeSecondary: entities.home?.secondary_info?.template,
      individualSecondary: entities.individual?.map((individual) => individual.secondary_info?.template),
      nonFossilFuelSecondary: entities.fossil_fuel_percentage?.secondary_info?.template,
    };

    for (const [key, value] of Object.entries(templatesObj)) {
      if (value) {
        if (Array.isArray(value)) {
          const individualKeys = ["left-top", "left-bottom", "right-top", "right-bottom"];
          value.forEach((template, index) => {
            if (template) this._tryConnect(template, `${individualKeys[index]}Secondary`);
          });
        } else {
          this._tryConnect(value, key);
        }
      }
    }
  }

  private async _tryConnect(inputTemplate: string, topic: string): Promise<void> {
    if (!this.hass || !this._config || this._unsubRenderTemplates?.get(topic) !== undefined || inputTemplate === "") {
      return;
    }

    try {
      const sub = subscribeRenderTemplate(
        this.hass.connection,
        (result) => {
          this._templateResults[topic] = result;
        },
        {
          template: inputTemplate,
          entity_ids: this._config.entity_id,
          variables: {
            config: this._config,
            user: this.hass.user!.name,
          },
          strict: true,
        }
      );
      this._unsubRenderTemplates?.set(topic, sub);
      await sub;
    } catch {
      this._templateResults = {
        ...this._templateResults,
        [topic]: {
          result: inputTemplate,
          listeners: { all: false, domains: [], entities: [], time: false },
        },
      };
      this._unsubRenderTemplates?.delete(topic);
    }
  }

  private async _tryDisconnectAll() {
    const { entities } = this._config;
    const templatesObj = {
      gridSecondary: entities.grid?.secondary_info?.template,
      solarSecondary: entities.solar?.secondary_info?.template,
      homeSecondary: entities.home?.secondary_info?.template,
      individualSecondary: entities.individual?.map((individual) => individual.secondary_info?.template),
    };

    for (const [key, value] of Object.entries(templatesObj)) {
      if (value) {
        this._tryDisconnect(key);
      }
    }
  }

  private async _tryDisconnect(topic: string): Promise<void> {
    const unsubRenderTemplate = this._unsubRenderTemplates?.get(topic);
    if (!unsubRenderTemplate) {
      return;
    }

    try {
      const unsub = await unsubRenderTemplate;
      unsub();
      this._unsubRenderTemplates?.delete(topic);
    } catch (err: any) {
      if (err.code === "not_found" || err.code === "template_error") {
        // If we get here, the connection was probably already closed. Ignore.
      } else {
        throw err;
      }
    }
  }

  static styles = styles;
}
