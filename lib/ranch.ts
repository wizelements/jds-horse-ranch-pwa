export const RANCH = {
  name: "JD's Horse Ranch",
  phone: "+14049812361",
  phoneDisplay: "(404) 981-2361",
  address: "7555 Jones Road, Fairburn, GA 30213",
  timeZone: "America/New_York",
  site: "https://jdshorseranch.com",
};

export function ranchTime(value: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: RANCH.timeZone, dateStyle: "medium", timeStyle: "short",
  }).format(new Date(value));
}

// datetime-local inputs have no zone. Resolve against the ranch, not the phone's zone.
// Reject DST gaps and ambiguous fall-back times instead of silently moving a ride.
export function ranchLocalToIso(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error("Choose a valid date and time.");
  const wall = Date.parse(value + "Z");
  if (!Number.isFinite(wall)) throw new Error("Choose a valid date and time.");
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: RANCH.timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  const matches = [4, 5].map(hours => new Date(wall + hours * 3600000)).filter(date => {
    const parts = formatter.formatToParts(date);
    const p = (key: string) => parts.find(part => part.type === key)?.value;
    return `${p("year")}-${p("month")}-${p("day")}T${p("hour")}:${p("minute")}` === value;
  });
  if (matches.length !== 1) throw new Error("This time falls in a daylight-saving clock change. Choose another time.");
  return matches[0].toISOString();
}

export function dollarsToCents(value: string, minimumCents = 100) {
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(value.trim())) throw new Error("Enter a dollar amount with at most two decimal places.");
  const [whole, decimal = ""] = value.trim().split(".");
  const cents = Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
  if (cents < minimumCents || cents > 1000000) throw new Error(`Enter an amount between $${(minimumCents / 100).toFixed(2)} and $10,000.`);
  return cents;
}
