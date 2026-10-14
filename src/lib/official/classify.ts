import type { ArtKind } from "@/lib/types";

// Category mapping for official products. The store's own product type / category is the most
// reliable signal; the title is only used when the store gives no type (or a vague one).

/** Merchandise and non-hardware items that don't belong in the catalog. */
export const SKIP_TYPE = /clothing|apparel|sticker|keychain|\bflag\b|merchandise|gift|toys?\b|hat\b|t-shirt|hoodie/i;

const TYPE_RULES: [RegExp, string][] = [
  [/accessor|spare|parts\b|canopy|holder|lens guard|filter|\bled\b|gate|strap|adapter|tester|^others?$|simulator|^gimbals?$/, "accessories"],
  [/vtol|fixed.?wing|airplane|plane|glider|delta fpv/, "vtol-fixed-wing"],
  // Whole drones only: "Drones", "FPV Drones", "Brushless Quad"… but not "Drone ESC" or "Drone GPS".
  [/^(rtf kit|brushless quad|brushed quad|development drone kit|fpvs)$|\bdrones?$|kopis fpv drone$/, "@drone"],
  [/goggle|receiver unit|\bvrx\b/, "goggles"],
  [/\bvtx\b|transmitter unit|vtx module|vista|osd|range extender|repeater|transmission system/, "air-units"],
  [/camera/, "fpv-cameras"],
  [/carbon fiber frame|frame/, "frames"],
  [/motor/, "motors"],
  [/propeller|\bprops?\b/, "propellers"],
  [/battery|lipo|lihv|life\b|li-ion/, "batteries"],
  [/charger/, "chargers"],
  [/\besc\b|electronic speed/, "escs"],
  [/\bfc\b|flight cont|stack|control system/, "flight-controllers"],
  [/express lrs receiver|rc receiver|^receiver$|receiver antenna/, "receivers"],
  [/external module|telemetry|^module$/, "long-range"],
  [/radio transmitter|radio$|^t8 radio/, "radios"],
  [/antenna/, "antennas"],
  [/gps|rtk/, "gps-sensors"],
  [/sensor/, "sensors-modules"],
  [/power module/, "power-modules"],
  [/cable|connector|pigtail|racewire/, "cables-connectors"],
  [/\bcase\b|\bbag\b/, "bags-cases"],
  [/single board|sbc|development board/, "dev-boards"],
];

const SPARE = /\b(screws?|stickers?|screen protector|replacement|spare|upgrade parts?|canopy|mounts?|bracket|holder|strap|lanyard|grips?|handle|buttons?|switch(es)?|knobs?|cover|panel|lens|filter|tpu|stick ends?|gimbals? for|o-?rings?|landing gear|servo arm|decal|damping|balls?|foam|padding|sponge|spacers?|standoffs?|nuts?|bolts?|washers?|bumpers?|guards?|protectors?|caps?|wing tips?|servos?|y cable|hatch|fuselage|tail|conversion kit|prop(eller)? saver|spinner|pushrod|horns?|linkage|parts bag|accessor(y|ies) bag|arms?)\b/;

const DEVICE = new Set(["radios", "goggles", "vtol-fixed-wing", "receivers", "long-range", "dev-boards", "accessories", "bags-cases"]);

const TITLE_RULES: [RegExp, string][] = [
  [/\b(gimbal camera|camera gimbal|3-axis gimbal|gimbal cam)\b/, "gimbal-cameras"],
  [/\bgoggle/, "goggles"],
  [/\b(vtol|fixed.?wing|flying wing|airplane|plane|glider|wingspan)\b/, "vtol-fixed-wing"],
  // Parts named after a drone model ("Nazgul5 frame", "Mobula8 motor") are parts, not drones.
  [/\bframe( kit)?\b/, "frames"],
  [/\bmotors?\b/, "motors"],
  [/\b(props?|propellers?)\b/, "propellers"],
  [/\b(whoop|cinewhoop|tiny ?hawk|meteor\d*|air\d{2}|mobula|cetus|pavo\d*|toothpick|alpha a\d{2}|bumblebee)\b/, "whoops-micro"],
  // iFlight drone families (their titles rarely say "drone").
  [/\b(nazgul\w*|evoque|chimera\w*|protek\w*|defender|cidora|helion|taurus|titan|mach r\d|commander|aos)\b/, "fpv-drones"],
  [/\bxing\w*\b/, "motors"],
  [/\b(bnf|pnp|rtf|ready to fly|fpv drone|freestyle drone|racing drone|quadcopter|cinelifter|drone kit)\b/, "fpv-drones"],
  [/\b(radio controller|transmitter|literadio)\b/, "radios"],
  [/\b(tx module|elrs module|crossfire tx|telemetry)\b/, "long-range"],
  [/\b(receiver|nano rx|elrs rx)\b/, "receivers"],
  [/\b(vtx|video transmitter|air unit|avatar|vista)\b/, "air-units"],
  [/\b(action camera|walnut|peanut|thumb|naked gopro|4k camera|hd camera)\b/, "action-cameras"],
  [/\b(fpv camera|camera|tvl|ratel|nebula)\b/, "fpv-cameras"],
  [/\b(antenna|lollipop|patch|helical|pagoda|stubby|moxon|dipole)\b/, "antennas"],
  [/\b(flight controller|fc|stack|aio|f405|f411|f722|h743|pixhawk|autopilot)\b/, "flight-controllers"],
  [/\b(esc|4in1|4-in-1)\b/, "escs"],
  [/\bmotors?\b/, "motors"],
  [/\b(props?|propellers?)\b/, "propellers"],
  [/\bframe( kit)?\b/, "frames"],
  [/\b(gps|gnss|compass|airspeed|rangefinder|lidar|optical flow)\b/, "gps-sensors"],
  [/\b(charger|charging|balance board|parallel board)\b/, "chargers"],
  [/\b(battery|batteries|lipo|li-ion|lihv|\d{3,5}\s?mah)\b/, "batteries"],
  [/\b(bec|pdb|power module|power distribution|current sensor)\b/, "power-modules"],
  [/\b(solder|soldering|pinecil|iron tip)\b/, "soldering"],
  [/\b(sbc|single board|soquartz|rockpro|quartz64|star64|ox64|pine a64|pinephone|pinebook|pinetab)\b/, "dev-boards"],
  [/\b(cable|connector|xt60|xt30|xt90|pigtail|wire|usb)\b/, "cables-connectors"],
  [/\b(bag|backpack|hard case|carry case|case)\b/, "bags-cases"],
  [/\b(tool|screwdriver|hex driver|wrench|plier|tweezer)\b/, "hand-tools"],
  [/\b(sensor|module)\b/, "sensors-modules"],
];

const droneKind = (title: string) =>
  /\b(whoop|cinewhoop|tiny ?hawk|meteor\d*|air\d{2}|mobula|pavo\d*|toothpick|65mm|75mm|85mm)\b/.test(title) ? "whoops-micro" : "fpv-drones";

function byTitle(title: string, fallback: string) {
  if (SPARE.test(title)) return "accessories";
  for (const [re, cat] of TITLE_RULES) if (re.test(title)) return cat;
  return fallback;
}

/** @param type the store's product type or joined categories; @param title the product title */
export function classify(type: string, title: string, fallback = "accessories") {
  const ty = type.toLowerCase().trim();
  const ti = title.toLowerCase();
  if (ty && !/^(product bundle|other)$/.test(ty)) {
    for (const [re, cat] of TYPE_RULES) {
      if (!re.test(ty)) continue;
      if (cat === "@drone") return SPARE.test(ti) ? "accessories" : droneKind(ti);
      // A spare listed under a part's type (e.g. "Camera" → damping balls) is an accessory;
      // whole devices (radios, goggles, planes, receivers) keep their type.
      if (!DEVICE.has(cat) && SPARE.test(ti)) return "accessories";
      // Combined store categories ("VTX & Receivers", "Battery and Charger"): the title decides.
      if (/&|\/|\band\b/.test(ty)) return byTitle(ti, "") || cat;
      return cat;
    }
  }
  return byTitle(ti, fallback);
}

const ART: Record<string, ArtKind> = {
  "fpv-drones": "quad", "whoops-micro": "whoop", "camera-drones": "camdrone", "vtol-fixed-wing": "wing",
  "industrial-drones": "camdrone", goggles: "goggles", "air-units": "airunit", "fpv-cameras": "fpvcam",
  antennas: "antenna", frames: "frame", motors: "motor", escs: "esc", "flight-controllers": "board",
  propellers: "prop", "gps-sensors": "gps", accessories: "tool", radios: "radio", receivers: "receiver",
  "long-range": "receiver", batteries: "battery", chargers: "charger", "power-modules": "board",
  "cables-connectors": "cable", "action-cameras": "actioncam", "gimbal-cameras": "gimbal", "dev-boards": "board",
  "sensors-modules": "gps", "lab-equipment": "meter", soldering: "iron", "hand-tools": "tool", "bags-cases": "bag",
};

export const artFor = (category: string): ArtKind => ART[category] ?? "board";
