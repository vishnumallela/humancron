export type Month =
  | "jan"
  | "feb"
  | "mar"
  | "apr"
  | "may"
  | "jun"
  | "jul"
  | "aug"
  | "sep"
  | "oct"
  | "nov"
  | "dec";
export type Week = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
export type Input =
  | number
  | number[]
  | { every: number }
  | { from: number; to: number }
  | { from: number; to: number; every: number };

export type Timezone =
  | "UTC"
  | "America/New_York"
  | "America/Chicago"
  | "America/Denver"
  | "America/Los_Angeles"
  | "America/Anchorage"
  | "America/Honolulu"
  | "America/Phoenix"
  | "America/Detroit"
  | "America/Indiana/Indianapolis"
  | "America/Toronto"
  | "America/Vancouver"
  | "America/Winnipeg"
  | "America/Halifax"
  | "America/St_Johns"
  | "America/Sao_Paulo"
  | "America/Argentina/Buenos_Aires"
  | "America/Santiago"
  | "America/Lima"
  | "America/Bogota"
  | "America/Caracas"
  | "America/Mexico_City"
  | "America/Monterrey"
  | "America/Tijuana"
  | "America/Guatemala"
  | "America/Panama"
  | "America/Puerto_Rico"
  | "America/Manaus"
  | "America/La_Paz"
  | "America/Asuncion"
  | "America/Montevideo"
  | "Europe/London"
  | "Europe/Dublin"
  | "Europe/Lisbon"
  | "Europe/Paris"
  | "Europe/Berlin"
  | "Europe/Amsterdam"
  | "Europe/Brussels"
  | "Europe/Madrid"
  | "Europe/Rome"
  | "Europe/Vienna"
  | "Europe/Zurich"
  | "Europe/Stockholm"
  | "Europe/Oslo"
  | "Europe/Copenhagen"
  | "Europe/Helsinki"
  | "Europe/Warsaw"
  | "Europe/Prague"
  | "Europe/Budapest"
  | "Europe/Bucharest"
  | "Europe/Athens"
  | "Europe/Istanbul"
  | "Europe/Moscow"
  | "Europe/Kiev"
  | "Europe/Minsk"
  | "Europe/Riga"
  | "Europe/Tallinn"
  | "Europe/Vilnius"
  | "Europe/Belgrade"
  | "Europe/Sofia"
  | "Europe/Zagreb"
  | "Africa/Cairo"
  | "Africa/Johannesburg"
  | "Africa/Lagos"
  | "Africa/Nairobi"
  | "Africa/Accra"
  | "Africa/Casablanca"
  | "Africa/Tunis"
  | "Africa/Algiers"
  | "Africa/Addis_Ababa"
  | "Africa/Khartoum"
  | "Africa/Dar_es_Salaam"
  | "Africa/Kampala"
  | "Asia/Dubai"
  | "Asia/Riyadh"
  | "Asia/Baghdad"
  | "Asia/Tehran"
  | "Asia/Karachi"
  | "Asia/Kolkata"
  | "Asia/Colombo"
  | "Asia/Dhaka"
  | "Asia/Kathmandu"
  | "Asia/Almaty"
  | "Asia/Tashkent"
  | "Asia/Tbilisi"
  | "Asia/Baku"
  | "Asia/Yerevan"
  | "Asia/Kabul"
  | "Asia/Yangon"
  | "Asia/Bangkok"
  | "Asia/Ho_Chi_Minh"
  | "Asia/Phnom_Penh"
  | "Asia/Jakarta"
  | "Asia/Singapore"
  | "Asia/Kuala_Lumpur"
  | "Asia/Manila"
  | "Asia/Hong_Kong"
  | "Asia/Shanghai"
  | "Asia/Taipei"
  | "Asia/Seoul"
  | "Asia/Tokyo"
  | "Asia/Makassar"
  | "Asia/Jayapura"
  | "Asia/Ulaanbaatar"
  | "Asia/Novosibirsk"
  | "Asia/Krasnoyarsk"
  | "Asia/Irkutsk"
  | "Asia/Yakutsk"
  | "Asia/Vladivostok"
  | "Asia/Magadan"
  | "Asia/Kamchatka"
  | "Pacific/Auckland"
  | "Pacific/Fiji"
  | "Pacific/Guam"
  | "Pacific/Honolulu"
  | "Pacific/Midway"
  | "Pacific/Tongatapu"
  | "Pacific/Port_Moresby"
  | "Pacific/Noumea"
  | "Australia/Sydney"
  | "Australia/Melbourne"
  | "Australia/Brisbane"
  | "Australia/Perth"
  | "Australia/Adelaide"
  | "Australia/Darwin"
  | "Australia/Hobart";

const toMonth: Record<Month, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

const toWeek: Record<Week, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

const RANGES: Record<string, [number, number]> = {
  second: [0, 59],
  minute: [0, 59],
  hour: [0, 23],
  day: [1, 31],
  month: [1, 12],
  weekday: [0, 6],
};

function assertInRange(value: number, field: string) {
  const range = RANGES[field];
  if (!range) throw new TypeError(`Unknown field: "${field}"`);
  const [min, max] = range;
  if (value < min || value > max) {
    throw new RangeError(
      `${field} value ${value} is out of range [${min}, ${max}]`,
    );
  }
}

function validateInput(input: Input, field: string) {
  const range = RANGES[field];
  if (!range) throw new TypeError(`Unknown field: "${field}"`);
  const [min, max] = range;
  if (typeof input === "number") {
    assertInRange(input, field);
  } else if (Array.isArray(input)) {
    input.forEach((v) => assertInRange(v, field));
  } else if ("from" in input) {
    assertInRange(input.from, field);
    assertInRange(input.to, field);
    if (input.from > input.to) {
      throw new RangeError(
        `${field}: 'from' (${input.from}) must be <= 'to' (${input.to})`,
      );
    }
    if ("every" in input && input.every < 1) {
      throw new RangeError(`${field}: 'every' step must be >= 1`);
    }
  } else if ("every" in input) {
    if (input.every < 1 || input.every > max - min) {
      throw new RangeError(
        `${field}: 'every' step ${input.every} is out of range [1, ${max - min}]`,
      );
    }
  }
}

function toCronString(input: Input | Month | Week, field?: string): string {
  if (typeof input === "string") {
    const resolved = toMonth[input as Month] ?? toWeek[input as Week];
    if (resolved === undefined)
      throw new TypeError(`Unknown month/weekday name: "${input}"`);
    return String(resolved);
  }
  if (field) validateInput(input, field);
  if (typeof input === "number") return String(input);
  if (Array.isArray(input)) return input.join(",");
  if (!("from" in input)) return `*/${input.every}`;
  const step = "every" in input ? `/${input.every}` : "";
  return `${input.from}-${input.to}${step}`;
}

export function isMatch(now: number, pattern: string): boolean {
  if (pattern === "*") return true;
  if (pattern.includes(","))
    return pattern.split(",").some((p) => isMatch(now, p.trim()));
  if (pattern.includes("/")) {
    const slashParts = pattern.split("/");
    const base = slashParts[0] ?? "*";
    const step = parseInt(slashParts[1] ?? "1", 10);
    if (base === "*") return now % step === 0;
    const dashParts = base.split("-");
    const start = parseInt(dashParts[0] ?? "0", 10);
    const end = parseInt(dashParts[1] ?? dashParts[0] ?? "0", 10);
    return now >= start && now <= end && (now - start) % step === 0;
  }
  if (pattern.includes("-")) {
    const rangeParts = pattern.split("-");
    const a = Number(rangeParts[0] ?? "0");
    const b = Number(rangeParts[1] ?? "0");
    return now >= a && now <= b;
  }
  return now === parseInt(pattern, 10);
}

function getTimeParts(date: Date, timezone: Timezone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    second: "numeric",
    minute: "numeric",
    hour: "numeric",
    day: "numeric",
    month: "numeric",
    weekday: "short",
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((p) => [p.type, p.value]),
  ) as Record<string, string>;

  // hour12:false can emit "24" for midnight — normalise to 0
  const hour = parseInt(parts["hour"] ?? "0", 10) % 24;

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    second: parseInt(parts["second"] ?? "0", 10),
    minute: parseInt(parts["minute"] ?? "0", 10),
    hour,
    day: parseInt(parts["day"] ?? "1", 10),
    month: parseInt(parts["month"] ?? "1", 10),
    weekday: weekdayMap[parts["weekday"] ?? "Sun"] ?? 0,
  };
}

class Pattern {
  private _second = "*";
  private _minute = "*";
  private _hour = "*";
  private _day = "*";
  private _month = "*";
  private _weekday = "*";
  private _timezone: Timezone = "UTC";

  sec(v: Input) {
    this._second = toCronString(v, "second");
    return this;
  }
  min(v: Input) {
    this._minute = toCronString(v, "minute");
    return this;
  }
  hour(v: Input) {
    this._hour = toCronString(v, "hour");
    return this;
  }
  date(v: Input) {
    this._day = toCronString(v, "day");
    return this;
  }
  month(v: Input | Month) {
    this._month = toCronString(v, "month");
    return this;
  }
  week(v: Input | Week) {
    this._weekday = toCronString(v, "weekday");
    return this;
  }

  tz(timezone: Timezone) {
    try {
      Intl.DateTimeFormat("en-US", { timeZone: timezone });
    } catch {
      throw new RangeError(`Unknown timezone: "${timezone}"`);
    }
    this._timezone = timezone;
    return this;
  }

  get cron() {
    return `${this._second} ${this._minute} ${this._hour} ${this._day} ${this._month} ${this._weekday} [${this._timezone}]`;
  }

  do(fn: () => void): () => void {
    let lastRun = -1;
    const tick = () => {
      const now = new Date();
      const parts = getTimeParts(now, this._timezone);
      const match =
        isMatch(parts.second, this._second) &&
        isMatch(parts.minute, this._minute) &&
        isMatch(parts.hour, this._hour) &&
        isMatch(parts.day, this._day) &&
        isMatch(parts.month, this._month) &&
        isMatch(parts.weekday, this._weekday);
      if (!match) return;
      const secondId = Math.floor(now.getTime() / 1000);
      if (lastRun === secondId) return;
      lastRun = secondId;
      fn();
    };
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }
}

export const when = () => new Pattern();
