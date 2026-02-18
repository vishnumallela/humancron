import { describe, test, expect, beforeEach, afterEach, mock, jest, spyOn } from "bun:test";
import { when, isMatch } from "./index";

// ─── isMatch ────────────────────────────────────────────────────────────────

describe("isMatch", () => {

  describe("wildcard", () => {
    test("matches any value", () => {
      expect(isMatch(0,  "*")).toBe(true);
      expect(isMatch(59, "*")).toBe(true);
      expect(isMatch(23, "*")).toBe(true);
    });
  });

  describe("single number", () => {
    test("matches exact value",   () => expect(isMatch(5, "5")).toBe(true));
    test("rejects non-match",     () => expect(isMatch(6, "5")).toBe(false));
    test("matches zero",          () => expect(isMatch(0, "0")).toBe(true));
  });

  describe("list", () => {
    test("matches value in list",     () => expect(isMatch(15, "0,15,30,45")).toBe(true));
    test("matches first in list",     () => expect(isMatch(0,  "0,15,30,45")).toBe(true));
    test("matches last in list",      () => expect(isMatch(45, "0,15,30,45")).toBe(true));
    test("rejects value not in list", () => expect(isMatch(10, "0,15,30,45")).toBe(false));
  });

  describe("range", () => {
    test("matches value inside range",  () => expect(isMatch(3, "1-5")).toBe(true));
    test("matches lower bound",         () => expect(isMatch(1, "1-5")).toBe(true));
    test("matches upper bound",         () => expect(isMatch(5, "1-5")).toBe(true));
    test("rejects value below range",   () => expect(isMatch(0, "1-5")).toBe(false));
    test("rejects value above range",   () => expect(isMatch(6, "1-5")).toBe(false));
  });

  describe("step (*/n)", () => {
    test("matches 0 with */5",          () => expect(isMatch(0,  "*/5")).toBe(true));
    test("matches 15 with */5",         () => expect(isMatch(15, "*/5")).toBe(true));
    test("matches 30 with */5",         () => expect(isMatch(30, "*/5")).toBe(true));
    test("rejects non-multiple",        () => expect(isMatch(7,  "*/5")).toBe(false));
    test("matches every second (*/2)",  () => expect(isMatch(4,  "*/2")).toBe(true));
  });

  describe("range+step", () => {
    test("matches start of range",      () => expect(isMatch(1,  "1-10/2")).toBe(true));
    test("matches mid step",            () => expect(isMatch(5,  "1-10/2")).toBe(true));
    test("matches last valid step",     () => expect(isMatch(9,  "1-10/2")).toBe(true));
    test("rejects off-step value",      () => expect(isMatch(2,  "1-10/2")).toBe(false));
    test("rejects value before range",  () => expect(isMatch(0,  "1-10/2")).toBe(false));
    test("rejects value beyond range",  () => expect(isMatch(11, "1-10/2")).toBe(false));
  });

});

// ─── Pattern builder ────────────────────────────────────────────────────────

describe("Pattern.cron", () => {

  test("defaults to * * * * * * [UTC]", () => {
    expect(when().cron).toBe("* * * * * * [UTC]");
  });

  test("single number fields", () => {
    expect(when().sec(0).min(30).hour(9).date(1).month(6).week(1).cron)
      .toBe("0 30 9 1 6 1 [UTC]");
  });

  test("array input", () => {
    expect(when().min([0, 15, 30, 45]).cron).toBe("* 0,15,30,45 * * * * [UTC]");
  });

  test("step input { every }", () => {
    expect(when().min({ every: 5 }).cron).toBe("* */5 * * * * [UTC]");
  });

  test("range input { from, to }", () => {
    expect(when().hour({ from: 9, to: 17 }).cron).toBe("* * 9-17 * * * [UTC]");
  });

  test("range+step input { from, to, every }", () => {
    expect(when().min({ from: 0, to: 30, every: 10 }).cron).toBe("* 0-30/10 * * * * [UTC]");
  });

  test("named month - jan", () => expect(when().month("jan").cron).toBe("* * * * 1 * [UTC]"));
  test("named month - dec", () => expect(when().month("dec").cron).toBe("* * * * 12 * [UTC]"));

  test("named weekday - sun", () => expect(when().week("sun").cron).toBe("* * * * * 0 [UTC]"));
  test("named weekday - sat", () => expect(when().week("sat").cron).toBe("* * * * * 6 [UTC]"));

  test("timezone is reflected in cron string", () => {
    expect(when().tz("America/New_York").cron).toBe("* * * * * * [America/New_York]");
  });

  test("chaining returns same instance", () => {
    const p = when();
    expect(p.min(0)).toBe(p);
  });

});

// ─── Validation ─────────────────────────────────────────────────────────────

describe("Validation", () => {
  test("throws on out-of-range second",  () => expect(() => when().sec(60)).toThrow(RangeError));
  test("throws on out-of-range minute",  () => expect(() => when().min(60)).toThrow(RangeError));
  test("throws on negative minute",      () => expect(() => when().min(-1)).toThrow(RangeError));
  test("throws on out-of-range hour",    () => expect(() => when().hour(24)).toThrow(RangeError));
  test("throws on out-of-range day",     () => expect(() => when().date(0)).toThrow(RangeError));
  test("throws on out-of-range month",   () => expect(() => when().month(13)).toThrow(RangeError));
  test("throws on out-of-range weekday", () => expect(() => when().week(7 as any)).toThrow(RangeError));
  test("throws when from > to",          () => expect(() => when().min({ from: 10, to: 5 })).toThrow(RangeError));
  test("throws on zero step",            () => expect(() => when().min({ every: 0 })).toThrow(RangeError));
  test("throws on unknown name string",  () => expect(() => (when() as any).month("xyz")).toThrow(TypeError));
  test("throws on invalid timezone",     () => expect(() => when().tz("Garbage/Zone" as any)).toThrow(RangeError));
});

// ─── Scheduler (.do) ────────────────────────────────────────────────────────
// Fake timers don't affect Intl.DateTimeFormat which reads the real clock
// internally. To keep tests deterministic we pin new Date() to a fixed
// timestamp and build the pattern from the known parts of that timestamp
// in UTC so Intl and Date always agree.

describe("Pattern.do", () => {

  // Fixed point in time: 2024-06-15 09:30:45 UTC
  const FIXED_MS   = Date.UTC(2024, 5, 15, 9, 30, 45); // month is 0-indexed
  const FIXED_DATE = new Date(FIXED_MS);

  let dateSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    jest.useFakeTimers();
    // Pin Date constructor and Date.now to the fixed timestamp
    dateSpy = spyOn(globalThis, "Date").mockImplementation(() => FIXED_DATE as any);
    (globalThis.Date as any).now = () => FIXED_MS;
  });

  afterEach(() => {
    jest.useRealTimers();
    dateSpy.mockRestore();
    jest.clearAllMocks();
  });

  test("returns a stop function", () => {
    const stop = when().do(() => {});
    expect(typeof stop).toBe("function");
    stop();
  });

  test("calls fn when pattern matches", () => {
    const fn = mock(() => {});

    // UTC parts of FIXED_DATE: sec=45 min=30 hour=9
    const stop = when()
      .sec(45)
      .min(30)
      .hour(9)
      .tz("UTC")
      .do(fn);

    jest.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(1);
    stop();
  });

  test("does not double-fire in the same second", () => {
    const fn = mock(() => {});

    const stop = when()
      .sec(45)
      .min(30)
      .hour(9)
      .tz("UTC")
      .do(fn);

    // first tick fires at 1000ms
    jest.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(1);

    // tick again within the same pinned second — dedup should block it
    jest.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1); // still 1, not 2
    stop();
  });

  test("does not fire when pattern does not match", () => {
    const fn = mock(() => {});

    // wrong second — should never match
    const stop = when().sec(0).min(30).hour(9).tz("UTC").do(fn);
    jest.advanceTimersByTime(5000);
    expect(fn).not.toHaveBeenCalled();
    stop();
  });

  test("stop() prevents further calls", () => {
    const fn = mock(() => {});

    const stop = when()
      .sec(45)
      .min(30)
      .hour(9)
      .tz("UTC")
      .do(fn);

    jest.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(1);

    stop();
    jest.advanceTimersByTime(60_000);
    expect(fn).toHaveBeenCalledTimes(1); // still 1
  });

});