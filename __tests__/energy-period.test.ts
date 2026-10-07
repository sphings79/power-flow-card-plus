import { describe, expect, it } from "@jest/globals";

import { periodRange, pickerRange } from "../src/energy/energy-totals";

// Wednesday, 18 June 2025, 14:30 local time.
const NOW = new Date(2025, 5, 18, 14, 30, 0);
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

describe("periodRange", () => {
  it("today runs from midnight to now", () => {
    const { start, end } = periodRange("today", NOW);
    expect(iso(start)).toBe("2025-06-18");
    expect(start.getHours()).toBe(0);
    expect(end).toEqual(NOW);
  });

  it("yesterday is the full previous day", () => {
    const { start, end } = periodRange("yesterday", NOW);
    expect(iso(start)).toBe("2025-06-17");
    expect(iso(end)).toBe("2025-06-18");
    expect(end.getHours()).toBe(0);
  });

  it("week starts on Monday", () => {
    const { start } = periodRange("week", NOW);
    expect(iso(start)).toBe("2025-06-16");
    expect(start.getDay()).toBe(1);
  });

  it("month starts on the first", () => {
    expect(iso(periodRange("month", NOW).start)).toBe("2025-06-01");
  });

  it("year starts on 1 January of the current year", () => {
    expect(iso(periodRange("year", NOW).start)).toBe("2025-01-01");
  });

  it("rolling windows include today and count whole days back", () => {
    expect(iso(periodRange("last_7_days", NOW).start)).toBe("2025-06-12");
    expect(iso(periodRange("last_30_days", NOW).start)).toBe("2025-05-20");
    expect(iso(periodRange("last_365_days", NOW).start)).toBe("2024-06-19");
  });

  it("rolling windows start at midnight, not at the current time", () => {
    const { start } = periodRange("last_7_days", NOW);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
  });

  it("week handles Sunday as the last day of the week, not the first", () => {
    const sunday = new Date(2025, 5, 22, 9, 0, 0);
    expect(iso(periodRange("week", sunday).start)).toBe("2025-06-16");
  });
});

import { displayEnergy } from "../src/utils/display-value";

const hass: any = { locale: { language: "en", number_format: "comma_decimal" } };
const cfg = (extra: any = {}) => ({ entities: {}, ...extra } as any);

describe("displayEnergy", () => {
  it("stays in kWh below the threshold", () => {
    expect(displayEnergy(hass, cfg(), 999)).toContain("kWh");
  });

  it("switches to MWh at the threshold", () => {
    const out = displayEnergy(hass, cfg(), 1000);
    expect(out).toContain("MWh");
    expect(out).toContain("1");
  });

  it("honours a lowered threshold", () => {
    expect(displayEnergy(hass, cfg({ kwh_threshold: 100 }), 300)).toContain("MWh");
    expect(displayEnergy(hass, cfg({ kwh_threshold: 100 }), 99)).toContain("kWh");
  });

  it("never switches when the threshold is zero", () => {
    expect(displayEnergy(hass, cfg({ kwh_threshold: 0 }), 50000)).toContain("kWh");
  });

  it("applies the switch to negative values too", () => {
    expect(displayEnergy(hass, cfg(), -1500)).toContain("MWh");
  });
});

import { productionColor, socColor, usageColor } from "../src/utils/usage-color";

const rgb = (s: string) => (s.match(/\d+/g) ?? []).map(Number);

describe("productionColor", () => {
  it("is red at barely any output and green at peak", () => {
    // Exactly zero is handled separately as idle; just above it is the red end.
    expect(rgb(productionColor(1, 5000))).toEqual(rgb(usageColor(4999, 5000)));
    expect(rgb(productionColor(5000, 5000))).toEqual(rgb(usageColor(0, 5000)));
  });

  it("is the mirror image of the usage ramp", () => {
    expect(rgb(productionColor(1000, 5000))).toEqual(rgb(usageColor(4000, 5000)));
  });

  it("treats each array against its own peak, so equal load ratios match", () => {
    // A 600 W balcony unit at full tilt reads like a 10 kW roof array at full tilt.
    expect(rgb(productionColor(600, 600))).toEqual(rgb(productionColor(10000, 10000)));
  });

  it("clamps output above the peak instead of wrapping back to red", () => {
    expect(rgb(productionColor(9000, 5000))).toEqual(rgb(productionColor(5000, 5000)));
  });

  it("returns nothing for a non-positive peak", () => {
    expect(productionColor(500, 0)).toBe("");
  });

  it("runs opposite to the battery ramp: little is red, full is green", () => {
    expect(rgb(socColor(1))).toEqual(rgb(productionColor(1, 100)));
    expect(rgb(socColor(100))).toEqual(rgb(productionColor(100, 100)));
  });
});

import { fetchEnergyTotals } from "../src/energy/energy-totals";

const hassWith = (response: any) => ({ callWS: async () => response }) as any;

describe("fetchEnergyTotals", () => {
  it("reports zero for a period that has no bucket yet", async () => {
    // Just after midnight there is no completed hour, so the API returns nothing.
    const totals = await fetchEnergyTotals(hassWith({}), ["sensor.a", "sensor.b"], "today", NOW);
    expect(totals).toEqual({ "sensor.a": 0, "sensor.b": 0 });
  });

  it("sums the change values across buckets", async () => {
    const totals = await fetchEnergyTotals(
      hassWith({ "sensor.a": [{ change: 1.5 }, { change: 2.25 }] }),
      ["sensor.a"],
      "today",
      NOW
    );
    expect(totals["sensor.a"]).toBeCloseTo(3.75);
  });

  it("falls back to the difference of cumulative sums when change is absent", async () => {
    const totals = await fetchEnergyTotals(
      hassWith({ "sensor.a": [{ sum: 100 }, { sum: 104.5 }] }),
      ["sensor.a"],
      "today",
      NOW
    );
    expect(totals["sensor.a"]).toBeCloseTo(4.5);
  });

  it("does not query at all without entities", async () => {
    let called = false;
    const hass = { callWS: async () => ((called = true), {}) } as any;
    expect(await fetchEnergyTotals(hass, [], "today", NOW)).toEqual({});
    expect(called).toBe(false);
  });
});

describe("productionColor at rest", () => {
  it("is grey rather than red when nothing is produced", () => {
    expect(productionColor(0, 5000)).toContain("--disabled-text-color");
  });

  it("is grey for a negative reading too", () => {
    expect(productionColor(-5, 5000)).toContain("--disabled-text-color");
  });

  it("switches to the ramp as soon as anything is produced", () => {
    expect(productionColor(1, 5000)).toMatch(/^rgb\(/);
  });
});

describe("pickerRange", () => {
  const ymd = (d: Date) => iso(d);

  it("the current unit ends now", () => {
    expect(pickerRange("day", 0, NOW).end).toEqual(NOW);
    expect(ymd(pickerRange("week", 0, NOW).start)).toBe("2025-06-16");
  });

  it("steps back a day, a week, a month and a year", () => {
    expect(ymd(pickerRange("day", -1, NOW).start)).toBe("2025-06-17");
    expect(ymd(pickerRange("week", -1, NOW).start)).toBe("2025-06-09");
    expect(ymd(pickerRange("month", -1, NOW).start)).toBe("2025-05-01");
    expect(ymd(pickerRange("year", -1, NOW).start)).toBe("2024-01-01");
  });

  it("an earlier unit ends where the next one starts", () => {
    expect(ymd(pickerRange("day", -1, NOW).end)).toBe("2025-06-18");
    expect(ymd(pickerRange("week", -1, NOW).end)).toBe("2025-06-16");
    expect(ymd(pickerRange("month", -1, NOW).end)).toBe("2025-06-01");
    expect(ymd(pickerRange("year", -1, NOW).end)).toBe("2025-01-01");
  });

  it("crosses year boundaries", () => {
    const jan = new Date(2025, 0, 10, 12);
    expect(ymd(pickerRange("month", -1, jan).start)).toBe("2024-12-01");
    expect(ymd(pickerRange("month", -1, jan).end)).toBe("2025-01-01");
  });

  it("honours a Sunday week start", () => {
    expect(ymd(pickerRange("week", 0, NOW, 0).start)).toBe("2025-06-15");
  });
});
