import type { ArtKind, Product, Tag, VariantOption } from "@/lib/types";

// Sample catalog. Prices are in INR and include GST.
// Replace with a database or CMS feed later; the rest of the app only uses lib/catalog.ts.

interface Seed {
  name: string;
  brand: string;
  cat: string;
  price: number;
  mrp?: number;
  stock: number;
  art: ArtKind;
  tags?: Tag[];
  short: string;
  hl: string[];
  specs: Record<string, string>;
  box?: string[];
  variant?: { name: string; options: VariantOption[] };
  w?: number;
}

const seeds: Seed[] = [
  // ───────── FPV drones
  {
    name: "GEPRC Mark5 O4 Pro 5 inch Freestyle Drone (ELRS BNF)", brand: "GEPRC", cat: "fpv-drones", price: 64999, mrp: 69999, stock: 6, art: "quad", tags: ["hot", "bestseller"],
    short: "Pre-tuned 5 inch freestyle quad with DJI O4 Pro, ready to bind to your ELRS radio.",
    hl: ["DJI O4 Pro 4K/120fps camera", "Taker H7 BT 55A stack", "SPEEDX2 2107.5 1960KV motors"],
    specs: { "Wheelbase": "225 mm", "Battery": "6S 1100–1300 mAh (XT60)", "Flight controller": "TAKER H7 BT", "ESC": "55A 4-in-1 BLHeli_32", "Video": "DJI O4 Pro", "Receiver": "ELRS 2.4 GHz", "Dry weight": "420 g" },
    box: ["Mark5 drone", "Spare props (2 sets)", "Battery straps", "Tool kit"], w: 420,
  },
  {
    name: "iFlight Nazgul Evoque F5D V2 6S HD (O4)", brand: "iFlight", cat: "fpv-drones", price: 58999, mrp: 62999, stock: 4, art: "quad", tags: ["hot"],
    short: "Deadcat 5 inch freestyle with props out of view, tuned for smooth HD footage.",
    hl: ["Deadcat geometry, props out of frame", "BLITZ F7 + 55A ESC", "XING2 2207 1855KV"],
    specs: { "Wheelbase": "226 mm", "Battery": "6S 1100–1400 mAh", "Flight controller": "BLITZ F7", "ESC": "BLITZ E55 4-in-1", "Video": "DJI O4", "Receiver": "ELRS 2.4 GHz", "Dry weight": "405 g" },
    w: 405,
  },
  {
    name: "BetaFPV Cetus X FPV Kit (Analog, RTF)", brand: "BetaFPV", cat: "fpv-drones", price: 19999, mrp: 22999, stock: 14, art: "quad", tags: ["bestseller"],
    short: "Everything a beginner needs in one box: drone, radio, goggles, batteries and charger.",
    hl: ["Normal, Sport and Manual modes", "Turtle mode to flip back after a crash", "LiteRadio 3 + VR03 goggles included"],
    specs: { "Wheelbase": "100 mm", "Battery": "1S 550 mAh (BT2.0)", "Flight time": "4–5 min", "Video": "5.8 GHz analog", "Receiver": "ELRS 2.4 GHz", "Skill level": "Beginner" },
    box: ["Cetus X drone", "LiteRadio 3", "VR03 goggles", "3 × 550 mAh batteries", "USB charger", "Carry case"], w: 1200,
  },
  {
    name: "SpeedyBee Bee35 Pro 3.5 inch Cinewhoop (O4)", brand: "SpeedyBee", cat: "fpv-drones", price: 39999, mrp: 43999, stock: 0, art: "quad",
    short: "Ducted 3.5 inch cinematic quad that carries O4 cleanly for proximity shots.",
    hl: ["Full-guard ducts", "F405 V4 BLS 55A stack", "Wireless config over Bluetooth"],
    specs: { "Wheelbase": "156 mm", "Battery": "6S 850–1050 mAh", "Flight controller": "SpeedyBee F405 V4", "Video": "DJI O4", "Receiver": "ELRS 2.4 GHz" },
    w: 310,
  },

  // ───────── Whoops & micro
  {
    name: "Happymodel Mobula7 1S Micro FPV Whoop", brand: "Happymodel", cat: "whoops-micro", price: 18999, mrp: 19999, stock: 11, art: "whoop", tags: ["bestseller"],
    short: "The classic 75 mm indoor whoop. Light, durable and easy to fly around the house.",
    hl: ["0802 23000KV motors", "Built-in ELRS receiver", "Analog 400 mW VTX"],
    specs: { "Wheelbase": "75 mm", "Battery": "1S 300 mAh (BT2.0)", "Flight controller": "X12 AIO 5-in-1", "Video": "Analog 5.8 GHz", "Weight": "22 g" }, w: 22,
  },
  {
    name: "BetaFPV Air65 Brushless Whoop (ELRS)", brand: "BetaFPV", cat: "whoops-micro", price: 11999, mrp: 12999, stock: 20, art: "whoop", tags: ["new"],
    short: "Ultra-light 65 mm whoop, among the lightest brushless 1S builds at under 20 g.",
    hl: ["Under 20 g", "Racing and freestyle versions", "Air 5-in-1 FC"],
    specs: { "Wheelbase": "65 mm", "Battery": "1S 260–300 mAh", "Motors": "0702 27000KV", "Video": "Analog 25–400 mW" },
    variant: { name: "Version", options: [
      { label: "Racing", price: 11999, mrp: 12999, stock: 12 },
      { label: "Freestyle", price: 11999, mrp: 12999, stock: 8 },
    ] }, w: 19,
  },
  {
    name: "BetaFPV Pavo20 Pro II Brushless Whoop (without O4)", brand: "BetaFPV", cat: "whoops-micro", price: 20999, mrp: 22999, stock: 7, art: "whoop", tags: ["hot"],
    short: "2 inch ducted cinewhoop built around the DJI O4 Lite and O4 Pro for indoor tours.",
    hl: ["Fits O4 / O4 Pro air units", "3S–4S brushless power", "Removable top canopy"],
    specs: { "Wheelbase": "90 mm", "Battery": "3S 450–550 mAh", "Motors": "1504 4500KV", "Video": "Bring your own O4" }, w: 70,
  },
  {
    name: "NewBeeDrone AcroBee75 BLV5 ELRS 2S", brand: "NewBeeDrone", cat: "whoops-micro", price: 20999, stock: 3, art: "whoop",
    short: "Outdoor-capable 2S whoop with punch for park freestyle.",
    hl: ["2S power", "SmartMAX VTX", "ELRS 2.4 GHz built in"],
    specs: { "Wheelbase": "75 mm", "Battery": "2S 300–450 mAh", "Video": "Analog", "Receiver": "ELRS 2.4 GHz" }, w: 32,
  },

  // ───────── Camera drones
  {
    name: "DJI Mini 4 Pro (DJI RC 2)", brand: "DJI", cat: "camera-drones", price: 104990, mrp: 109990, stock: 5, art: "camdrone", tags: ["bestseller"],
    short: "Under-249 g camera drone with omnidirectional obstacle sensing and 4K/60 HDR.",
    hl: ["1/1.3-inch CMOS, 4K/60fps HDR", "Omnidirectional obstacle sensing", "20 km O4 video transmission"],
    specs: { "Takeoff weight": "< 249 g", "Max flight time": "34 min", "Camera": "48 MP, 1/1.3-inch", "Transmission": "DJI O4, 20 km (FCC)", "Controller": "DJI RC 2" },
    variant: { name: "Bundle", options: [
      { label: "DJI RC 2", price: 104990, mrp: 109990, stock: 5 },
      { label: "Fly More Combo Plus", price: 129990, mrp: 134990, stock: 2 },
    ] }, w: 249,
  },
  {
    name: "DJI Avata 2 Fly More Combo (3 batteries)", brand: "DJI", cat: "camera-drones", price: 119990, stock: 3, art: "whoop", tags: ["hot"],
    short: "Immersive FPV with Goggles 3 and motion controller, built-in prop guards.",
    hl: ["1/1.3-inch 4K/60 camera", "Goggles 3 + RC Motion 3", "Easy ACRO one-push flips"],
    specs: { "Weight": "377 g", "Max flight time": "23 min", "Camera": "4K/60fps, 155° FOV", "Goggles": "DJI Goggles 3" }, w: 377,
  },
  {
    name: "DJI Air 3S (DJI RC-N3)", brand: "DJI", cat: "camera-drones", price: 129990, stock: 0, art: "camdrone", tags: ["new"],
    short: "Dual-camera travel drone with 1-inch main sensor and LiDAR night obstacle sensing.",
    hl: ["1-inch CMOS wide camera", "70 mm medium tele camera", "Forward LiDAR"],
    specs: { "Takeoff weight": "724 g", "Max flight time": "45 min", "Camera": "50 MP 1-inch + 48 MP tele", "Transmission": "O4, 20 km" }, w: 724,
  },

  // ───────── VTOL & fixed wing
  {
    name: "Heewing T1-S Ranger S VTOL PNP with Carry Case", brand: "Heewing", cat: "vtol-fixed-wing", price: 49999, mrp: 54999, stock: 4, art: "wing", tags: ["hot"],
    short: "Compact tilt-rotor VTOL that takes off like a quad and cruises like a plane.",
    hl: ["730 mm wingspan", "Tilt-rotor VTOL", "Fits a backpack case"],
    specs: { "Wingspan": "730 mm", "Battery": "2S–3S Li-ion / LiPo", "Flight time": "Up to 60 min (Li-ion)", "Version": "PNP" },
    variant: { name: "Version", options: [
      { label: "PNP", price: 49999, mrp: 54999, stock: 4 },
      { label: "PNP + Matek H743 Wing", price: 59999, mrp: 64999, stock: 2 },
    ] },
  },
  {
    name: "HEEWING T2 Cruza VTOL PNP + FC with Case", brand: "Heewing", cat: "vtol-fixed-wing", price: 124999, mrp: 149999, stock: 2, art: "wing",
    short: "Long-endurance twin-motor VTOL for mapping and long-range FPV.",
    hl: ["1.3 m wingspan", "ArduPilot-ready FC included", "Hard case"],
    specs: { "Wingspan": "1300 mm", "Battery": "4S Li-ion", "Flight time": "Up to 90 min", "Payload bay": "Camera / gimbal" },
  },
  {
    name: "Durafly EFXtra Racer PNF Green Edition 975mm", brand: "Durafly", cat: "vtol-fixed-wing", price: 31999, mrp: 34999, stock: 3, art: "wing",
    short: "Fast EPO sport racer that tracks like it is on rails.",
    hl: ["975 mm span", "Brushless power system", "Metal-geared servos"],
    specs: { "Wingspan": "975 mm", "Battery": "4S 2200 mAh", "Top speed": "~200 km/h", "Version": "PNF" },
  },

  // ───────── Industrial
  {
    name: "Skydroid H12 Pro Ground Control Station", brand: "Skydroid", cat: "industrial-drones", price: 74999, mrp: 79999, stock: 3, art: "radio",
    short: "Android GCS with integrated 1080p video and telemetry link for ArduPilot / PX4.",
    hl: ["5.5-inch 1000 nit screen", "Up to 10 km link", "Dual operator support"],
    specs: { "Screen": "5.5-inch 1080p", "Range": "10 km", "Channels": "12", "OS": "Android 7.1" },
  },
  {
    name: "Skydroid S10 Handheld Drone Alarm", brand: "Skydroid", cat: "industrial-drones", price: 68999, mrp: 70350, stock: 2, art: "receiver",
    short: "Portable RF detector that alerts on nearby drone control and video signals.",
    hl: ["Passive detection", "Multi-band scanning", "Vibration + sound alarm"],
    specs: { "Bands": "433 MHz, 900 MHz, 1.2/2.4/5.8 GHz", "Battery": "8 h", "Range": "1–2 km (typical)" },
  },

  // ───────── Goggles
  {
    name: "DJI Goggles Integra", brand: "DJI", cat: "goggles", price: 40999, stock: 8, art: "goggles", tags: ["bestseller"],
    short: "All-in-one DJI goggles with built-in battery, compatible with O4 and O3.",
    hl: ["1080p Micro-OLED screens", "Integrated battery on headband", "Real-time head tracking"],
    specs: { "Screens": "1080p Micro-OLED, 100 Hz", "FOV": "44°", "Battery life": "2 h", "Compatible": "O4, O4 Pro, O3, Avata 2" },
    variant: { name: "Bundle", options: [
      { label: "Goggles only", price: 40999, stock: 8 },
      { label: "With RC Motion 3", price: 42999, stock: 4 },
    ] },
  },
  {
    name: "DJI Goggles N3", brand: "DJI", cat: "goggles", price: 21999, mrp: 23999, stock: 10, art: "goggles", tags: ["new"],
    short: "Budget-friendly DJI goggles for O4 air units and Neo / Avata 2.",
    hl: ["1080p LCD screen", "54° wide FOV", "Works with O4 Lite"],
    specs: { "Screen": "1080p LCD", "FOV": "54°", "Latency": "From 31 ms", "Compatible": "O4, Avata 2, Neo" },
  },
  {
    name: "Fat Shark Dominator HDO+ FPV Goggles", brand: "Fat Shark", cat: "goggles", price: 74999, stock: 3, art: "goggles", tags: ["new"],
    short: "Premium OLED analog / HDZero-ready goggles with the classic Dominator form factor.",
    hl: ["OLED displays", "Module bay for receivers", "HDMI in"],
    specs: { "Screens": "OLED", "FOV": "46°", "Module bay": "Standard Fat Shark", "Inputs": "AV, HDMI" },
    variant: { name: "Package", options: [
      { label: "Goggles", price: 74999, stock: 3 },
      { label: "Goggles + HDZero VRX", price: 109999, stock: 1 },
    ] },
  },
  {
    name: "HDZero Goggle 2", brand: "HDZero", cat: "goggles", price: 54999, mrp: 57999, stock: 4, art: "goggles",
    short: "Zero-latency digital goggles with fixed frame rate, also accepts analog.",
    hl: ["1080p OLED 90 Hz", "Built-in analog receiver", "Fixed-latency digital link"],
    specs: { "Screens": "1080p OLED", "FOV": "46°", "Latency": "Fixed, sub-frame", "Analog": "Yes" },
  },

  // ───────── Air units
  {
    name: "DJI O4 Air Unit Pro", brand: "DJI", cat: "air-units", price: 23999, mrp: 25999, stock: 12, art: "airunit", tags: ["bestseller"],
    short: "1/1.3-inch sensor 4K/120fps digital FPV system with onboard recording.",
    hl: ["4K/120fps, 155° FOV", "Up to 15 km range", "Onboard 4K recording"],
    specs: { "Sensor": "1/1.3-inch", "Video": "4K/120fps", "Range": "15 km (FCC)", "Weight": "36.4 g" },
  },
  {
    name: "DJI O4 Air Unit (Wide)", brand: "DJI", cat: "air-units", price: 16499, mrp: 19999, stock: 15, art: "airunit", tags: ["hot"],
    short: "Lightweight 8.1 g digital air unit, ideal for whoops and toothpicks.",
    hl: ["8.1 g", "4K/60 onboard recording", "155° wide FOV"],
    specs: { "Weight": "8.1 g", "Video": "4K/60fps", "Range": "10 km (FCC)", "Input": "3.7–13.2 V" },
  },
  {
    name: "Walksnail Avatar HD Pro Kit V2", brand: "Walksnail", cat: "air-units", price: 15999, stock: 6, art: "airunit",
    short: "1080p/60 digital system with Gyroflow support and 32 GB storage.",
    hl: ["Starlight sensor", "Gyroflow metadata", "32 GB built in"],
    specs: { "Video": "1080p/100fps", "Storage": "32 GB", "Power": "Up to 1 W", "Weight": "29 g" },
  },
  {
    name: "TBS Unify Pro32 HV 5.8 GHz VTX", brand: "TBS", cat: "air-units", price: 4499, mrp: 4999, stock: 18, art: "airunit",
    short: "Reliable analog VTX with SmartAudio and up to 1 W output.",
    hl: ["25–1000 mW", "SmartAudio V2.1", "Clean output, low noise"],
    specs: { "Output": "25/200/500/1000 mW", "Input": "6–36 V", "Mount": "20 × 20 mm" },
  },

  // ───────── FPV cameras
  {
    name: "Caddx Ratel 2 Analog FPV Camera", brand: "Caddx", cat: "fpv-cameras", price: 2799, mrp: 3199, stock: 25, art: "fpvcam",
    short: "Starlight analog camera with great low-light performance.",
    hl: ["1200 TVL", "Starlight sensor", "Micro 19 mm"],
    specs: { "Resolution": "1200 TVL", "Sensor": "1/1.8-inch Starlight", "Lens": "2.1 mm", "Size": "19 × 19 mm" },
  },
  {
    name: "RunCam Phoenix 2 SE V2", brand: "RunCam", cat: "fpv-cameras", price: 2499, stock: 0, art: "fpvcam",
    short: "Freestyle-favourite analog camera with natural colours.",
    hl: ["1500 TVL", "4:3 / 16:9 switchable", "Micro size"],
    specs: { "Resolution": "1500 TVL", "Latency": "< 5 ms", "Size": "19 × 19 mm" },
  },
  {
    name: "NewBeeDrone Whoop Training Camera (1 pc)", brand: "NewBeeDrone", cat: "fpv-cameras", price: 1299, mrp: 1499, stock: 30, art: "fpvcam",
    short: "Tiny, tough camera for whoop builds and repairs.",
    hl: ["Nano size", "Wide 170° lens", "3.3–5 V input"],
    specs: { "Size": "14 × 14 mm", "Lens": "170°", "Weight": "2 g" },
  },

  // ───────── Antennas
  {
    name: "TRUERC X-AIR 5.8 MK II for DJI Goggles 2 (pair)", brand: "TrueRC", cat: "antennas", price: 7999, mrp: 9999, stock: 9, art: "antenna", tags: ["hot"],
    short: "Directional patch upgrade that extends DJI goggle range and penetration.",
    hl: ["High gain directional", "Direct fit for Goggles 2/3/Integra", "Pair (2 pcs)"],
    specs: { "Frequency": "5.8 GHz", "Gain": "~10 dBi", "Polarisation": "LHCP / RHCP", "Connector": "Goggle-specific" },
  },
  {
    name: "TBS Triumph Stub RP-SMA (LHCP, 2 pcs)", brand: "TBS", cat: "antennas", price: 999, stock: 40, art: "antenna",
    short: "Short, durable stubby antenna for goggles and tight builds.",
    hl: ["Compact stubby form", "LHCP", "RP-SMA"],
    specs: { "Frequency": "5.8 GHz", "Connector": "RP-SMA", "Polarisation": "LHCP" },
  },
  {
    name: "Readytosky Triple Feed Patch 8 dBi", brand: "Readytosky", cat: "antennas", price: 1199, mrp: 1499, stock: 22, art: "antenna",
    short: "Budget directional patch for longer analog range.",
    hl: ["8 dBi gain", "Triple feed", "SMA / RP-SMA"],
    specs: { "Frequency": "5.8 GHz", "Gain": "8 dBi", "Beamwidth": "~70°" },
  },

  // ───────── Frames
  {
    name: "GEP-MK5 O4 Pro Wide X Frame (Emerald Green)", brand: "GEPRC", cat: "frames", price: 7000, stock: 8, art: "frame", tags: ["new"],
    short: "Mark5 frame with O4 Pro mount and coloured TPU parts.",
    hl: ["Wide X geometry", "5 mm arms", "O4 Pro mount included"],
    specs: { "Wheelbase": "225 mm", "Arm thickness": "5 mm", "Stack": "30.5 / 20 mm", "Weight": "118 g" },
  },
  {
    name: "SpeedyBee Master 5 V2 Frame", brand: "SpeedyBee", cat: "frames", price: 9999, mrp: 10999, stock: 12, art: "frame", tags: ["bestseller"],
    short: "Tough freestyle frame with replaceable arm design and clean wiring layout.",
    hl: ["T700 carbon", "Easy arm swap", "Analog and digital mounts"],
    specs: { "Wheelbase": "226 mm", "Arm thickness": "5.5 mm", "Stack": "30.5 mm", "Weight": "140 g" },
  },
  {
    name: "SpeedyBee Bee35 3.5 inch Frame (Pro)", brand: "SpeedyBee", cat: "frames", price: 5499, mrp: 5999, stock: 10, art: "frame",
    short: "Ducted 3.5 inch cinewhoop frame for O4 builds.",
    hl: ["Full ducts", "Soft-mounted camera", "O4 Pro compatible"],
    specs: { "Prop size": "3.5 inch", "Stack": "20 / 30.5 mm", "Weight": "95 g" },
  },
  {
    name: "F450 / Q450 Quadcopter Frame Kit (PCB)", brand: "Generic", cat: "frames", price: 999, stock: 50, art: "frame", tags: ["bestseller"],
    short: "Classic learning frame with integrated power distribution PCB.",
    hl: ["Integrated PDB", "Glass fibre plates", "Great for APM / Pixhawk learning"],
    specs: { "Wheelbase": "450 mm", "Motor mount": "16/19 mm", "Weight": "282 g" },
  },

  // ───────── Motors
  {
    name: "T-Motor Velox V2207.5 V2 1950KV", brand: "T-Motor", cat: "motors", price: 1999, mrp: 2299, stock: 48, art: "motor", tags: ["bestseller"],
    short: "Smooth, durable 5 inch freestyle motor at a fair price.",
    hl: ["N52H magnets", "Titanium alloy shaft", "Unibell design"],
    specs: { "Stator": "2207.5", "KV": "1950 (6S)", "Weight": "33.4 g", "Shaft": "5 mm" },
    variant: { name: "KV", options: [
      { label: "1950KV (6S)", price: 1999, mrp: 2299, stock: 28 },
      { label: "2550KV (4S)", price: 1999, mrp: 2299, stock: 20 },
    ] },
  },
  {
    name: "MAD 5005 280KV V2 EEE Drone Motor", brand: "MAD", cat: "motors", price: 8999, mrp: 11999, stock: 6, art: "motor",
    short: "Efficient heavy-lift motor for 15–17 inch multirotors.",
    hl: ["High efficiency", "IP45 dust/water resistance", "Heavy-lift rated"],
    specs: { "Stator": "5005", "KV": "280", "Voltage": "6S–12S", "Weight": "195 g" },
  },
  {
    name: "MAD CM3120 Banshee FPV Drone Motor", brand: "MAD", cat: "motors", price: 8999, mrp: 12999, stock: 4, art: "motor", tags: ["hot"],
    short: "Big-thrust motor for 10–13 inch long range and cargo FPV.",
    hl: ["High torque", "Hollow shaft", "Industrial bearings"],
    specs: { "Stator": "3120", "KV": "900", "Voltage": "6S", "Weight": "112 g" },
  },
  {
    name: "BetaFPV 0802SE 19000KV Whoop Motors (4 pcs)", brand: "BetaFPV", cat: "motors", price: 2999, stock: 16, art: "motor",
    short: "Drop-in replacement motors for 1S whoops.",
    hl: ["Set of 4", "JST 1.25 plug", "0.8 mm shaft"],
    specs: { "Stator": "0802", "KV": "19000", "Weight": "1.9 g each" },
  },

  // ───────── ESCs
  {
    name: "TBS Lucid 16S 120A Rawdog ESC", brand: "TBS", cat: "escs", price: 14999, mrp: 16999, stock: 3, art: "esc",
    short: "High-voltage single ESC for heavy-lift and X-class builds.",
    hl: ["Up to 16S", "120A continuous", "AM32 firmware"],
    specs: { "Voltage": "4S–16S", "Current": "120 A", "Firmware": "AM32" },
  },
  {
    name: "SpeedyBee BLS 55A 30x30 4-in-1 ESC", brand: "SpeedyBee", cat: "escs", price: 4999, mrp: 5499, stock: 14, art: "esc", tags: ["bestseller"],
    short: "Reliable 4-in-1 for 5 to 7 inch builds.",
    hl: ["55A continuous", "BLHeli_S / Bluejay", "3–6S"],
    specs: { "Voltage": "3S–6S", "Current": "55 A", "Mount": "30.5 × 30.5 mm" },
  },

  // ───────── Flight controllers
  {
    name: "Matek H743-SLIM V4 Flight Controller", brand: "Matek", cat: "flight-controllers", price: 16899, mrp: 17999, stock: 5, art: "board", tags: ["hot"],
    short: "STM32H743 controller for ArduPilot and iNav fixed wing and multirotor.",
    hl: ["480 MHz H7", "Dual IMU", "Blackbox on microSD"],
    specs: { "MCU": "STM32H743", "IMU": "ICM42688P × 2", "Firmware": "ArduPilot, iNav, Betaflight", "UARTs": "7" },
  },
  {
    name: "SpeedyBee F405 V4 BLS 55A 30x30 Stack", brand: "SpeedyBee", cat: "flight-controllers", price: 6999, mrp: 7499, stock: 20, art: "board", tags: ["bestseller"],
    short: "Popular F4 stack with Bluetooth config from your phone.",
    hl: ["Wireless Betaflight config", "55A 4-in-1 ESC", "Blackbox flash"],
    specs: { "MCU": "STM32F405", "ESC": "55A BLS", "Mount": "30.5 mm", "Firmware": "Betaflight, iNav" },
  },
  {
    name: "Holybro Pixhawk 6C Mini (M10 GPS)", brand: "Holybro", cat: "flight-controllers", price: 29999, stock: 4, art: "board",
    short: "Compact Pixhawk standard autopilot for PX4 and ArduPilot.",
    hl: ["STM32H743", "Triple-redundant IMU", "Includes M10 GPS"],
    specs: { "MCU": "STM32H743", "Firmware": "PX4, ArduPilot", "Weight": "39 g" },
  },

  // ───────── Props
  {
    name: "Gemfan 51466 Hurricane 3-blade Props (2 sets)", brand: "Gemfan", cat: "propellers", price: 299, stock: 120, art: "prop", tags: ["bestseller"],
    short: "The go-to 5.1 inch freestyle prop.",
    hl: ["Durable PC material", "Smooth, locked-in feel", "2 sets (8 props)"],
    specs: { "Diameter": "5.1 inch", "Pitch": "4.66", "Blades": "3", "Hub": "5 mm" },
    variant: { name: "Colour", options: [
      { label: "Clear Orange", price: 299, stock: 50 },
      { label: "Clear Blue", price: 299, stock: 40 },
      { label: "Black", price: 299, stock: 30 },
    ] },
  },
  {
    name: "HQProp T76mm Whoop Props 1.5 mm Shaft", brand: "HQProp", cat: "propellers", price: 249, stock: 60, art: "prop",
    short: "Whoop props for 75 mm builds.",
    hl: ["4 blade", "1.5 mm shaft", "2 CW + 2 CCW × 2"],
    specs: { "Diameter": "76 mm", "Blades": "4", "Shaft": "1.5 mm" },
  },
  {
    name: "T-Motor MS1503 Carbon Prop (15 inch, pair)", brand: "T-Motor", cat: "propellers", price: 3499, stock: 10, art: "prop",
    short: "Carbon fibre prop pair for heavy lift and endurance.",
    hl: ["Carbon fibre", "Balanced pair", "CW + CCW"],
    specs: { "Diameter": "15 inch", "Pitch": "5.0", "Material": "Carbon fibre" },
  },

  // ───────── GPS
  {
    name: "Zerodrag LOC8-M10 GPS Module (Made in India)", brand: "Zerodrag", cat: "gps-sensors", price: 2299, mrp: 2499, stock: 35, art: "gps", tags: ["made-in-india", "new"],
    short: "Small M10 GNSS module for return-to-home and GPS rescue.",
    hl: ["u-blox M10", "NavIC-ready firmware roadmap", "20 × 20 mm"],
    specs: { "Chip": "M10", "Constellations": "GPS, GLONASS, Galileo, BeiDou", "Update rate": "10 Hz", "Size": "20 × 20 mm" },
  },
  {
    name: "Matek M10Q-5883 GNSS & Compass", brand: "Matek", cat: "gps-sensors", price: 8999, mrp: 9999, stock: 9, art: "gps",
    short: "GNSS + QMC5883L compass for iNav and ArduPilot.",
    hl: ["M10 chip", "Built-in compass", "CAN-free simple wiring"],
    specs: { "Chip": "u-blox M10", "Compass": "QMC5883L", "Update rate": "10 Hz" },
  },

  // ───────── Radios
  {
    name: "RadioMaster TX16S MK3 MAX (ELRS / M2)", brand: "RadioMaster", cat: "radios", price: 31999, mrp: 33999, stock: 7, art: "radio", tags: ["hot", "bestseller"],
    short: "Full-size EdgeTX radio with hall gimbals and big touchscreen.",
    hl: ["AG01 full CNC hall gimbals", "4.3-inch touchscreen", "ELRS 1 W internal"],
    specs: { "Firmware": "EdgeTX", "Gimbals": "AG01 CNC hall", "Internal RF": "ELRS 2.4 GHz 1 W", "Battery": "2 × 21700 (not included)" },
    variant: { name: "Gimbals", options: [
      { label: "AG01 gimbals", price: 31999, mrp: 33999, stock: 4 },
      { label: "Standard hall gimbals", price: 27999, mrp: 29999, stock: 3 },
    ] },
  },
  {
    name: "RadioMaster TX15 Radio Controller (ELRS / M2)", brand: "RadioMaster", cat: "radios", price: 19499, mrp: 21999, stock: 10, art: "radio", tags: ["new"],
    short: "Mid-size EdgeTX radio with colour screen and long battery life.",
    hl: ["Colour screen", "ELRS 1 W", "Hall gimbals"],
    specs: { "Firmware": "EdgeTX", "Internal RF": "ELRS 2.4 GHz", "Battery": "2 × 18650" },
  },
  {
    name: "RadioMaster Pocket ELRS", brand: "RadioMaster", cat: "radios", price: 6999, mrp: 7999, stock: 25, art: "radio", tags: ["bestseller"],
    short: "Compact, affordable starter radio with ELRS built in.",
    hl: ["Foldable design", "ELRS 250 mW", "Simulator over USB-C"],
    specs: { "Firmware": "EdgeTX", "Internal RF": "ELRS 2.4 GHz 250 mW", "Battery": "2 × 18650" },
  },
  {
    name: "RadioMaster AX12 Android Radio Controller", brand: "RadioMaster", cat: "radios", price: 31499, mrp: 33999, stock: 3, art: "radio",
    short: "Android radio with built-in screen for GCS apps.",
    hl: ["7-inch display", "Runs QGC and Mission Planner", "Dual-band link"],
    specs: { "OS": "Android", "Screen": "7-inch", "RF": "ELRS dual band" },
  },

  // ───────── Receivers
  {
    name: "HGLRC Gemini ELRS Dual-Band Receiver (915 MHz & 2.4 GHz)", brand: "HGLRC", cat: "receivers", price: 3499, mrp: 3999, stock: 14, art: "receiver", tags: ["hot"],
    short: "Gemini diversity receiver that listens on both bands at once.",
    hl: ["Dual-band Gemini", "Single or dual antenna", "Telemetry"],
    specs: { "Protocol": "ExpressLRS", "Bands": "900 MHz + 2.4 GHz", "Antenna": "IPEX" },
  },
  {
    name: "RadioMaster RP1 V2 ELRS Nano Receiver", brand: "RadioMaster", cat: "receivers", price: 1299, stock: 60, art: "receiver", tags: ["bestseller"],
    short: "Tiny, reliable ELRS receiver for every build.",
    hl: ["2.4 GHz", "T antenna", "0.5 g"],
    specs: { "Protocol": "ExpressLRS", "Band": "2.4 GHz", "Weight": "0.5 g" },
  },
  {
    name: "TBS Crossfire Nano RX (SE)", brand: "TBS", cat: "receivers", price: 2799, stock: 9, art: "receiver",
    short: "900 MHz long-range receiver for Crossfire systems.",
    hl: ["900 MHz", "Low latency", "Immortal T antenna"],
    specs: { "Protocol": "Crossfire", "Band": "868/915 MHz" },
  },

  // ───────── Long range
  {
    name: "RFD900A Modem 915 MHz Ultra Long Range", brand: "RFDesign", cat: "long-range", price: 22999, mrp: 24999, stock: 4, art: "receiver",
    short: "Industrial telemetry radio for 40 km+ MAVLink links.",
    hl: ["1 W output", "40 km+ line of sight", "MAVLink aware"],
    specs: { "Frequency": "902–928 MHz", "Output": "1 W", "Range": "40 km+ LOS" },
  },
  {
    name: "Holybro SiK Telemetry Radio V3 (pair)", brand: "Holybro", cat: "long-range", price: 5499, stock: 15, art: "receiver",
    short: "Plug-and-play telemetry for QGroundControl and Mission Planner.",
    hl: ["100 mW", "Air + ground unit", "JST-GH cable"],
    specs: { "Frequency": "433 / 915 MHz", "Output": "100 mW", "Range": "~300 m+" },
  },

  // ───────── Batteries
  {
    name: "Tattu R-Line V6 1700mAh 6S 160C LiPo (XT60)", brand: "Tattu", cat: "batteries", price: 5499, stock: 22, art: "battery", tags: ["bestseller"],
    short: "Race-grade 6S pack with low sag and long cycle life.",
    hl: ["160C rated", "Low internal resistance", "XT60 connector"],
    specs: { "Capacity": "1700 mAh", "Cells": "6S (22.2 V)", "Discharge": "160C", "Weight": "~285 g" },
  },
  {
    name: "CNHL Black Series 1300mAh 6S 100C LiPo", brand: "CNHL", cat: "batteries", price: 3499, mrp: 3799, stock: 30, art: "battery", tags: ["hot"],
    short: "Great value 6S pack for 5 inch freestyle.",
    hl: ["100C", "XT60", "Durable pack"],
    specs: { "Capacity": "1300 mAh", "Cells": "6S", "Discharge": "100C", "Weight": "~215 g" },
    variant: { name: "Pack", options: [
      { label: "1 pack", price: 3499, mrp: 3799, stock: 30 },
      { label: "4 packs", price: 12999, mrp: 15196, stock: 8 },
    ] },
  },
  {
    name: "BetaFPV LAVA 1S 550mAh 75C (4 pcs)", brand: "BetaFPV", cat: "batteries", price: 2299, stock: 40, art: "battery",
    short: "High-voltage 1S packs for whoops.",
    hl: ["LiHV 4.35 V", "BT2.0 connector", "Pack of 4"],
    specs: { "Capacity": "550 mAh", "Cells": "1S LiHV", "Connector": "BT2.0" },
  },

  // ───────── Chargers
  {
    name: "ToolkitRC M8AC Smart Charger (AC/DC 150W)", brand: "ToolkitRC", cat: "chargers", price: 6999, mrp: 7499, stock: 18, art: "charger", tags: ["bestseller"],
    short: "Compact AC/DC charger with a bright IPS screen.",
    hl: ["AC 150 W / DC 300 W", "1–6S LiPo", "Cell checker and servo tester"],
    specs: { "Input": "AC 100–240 V / DC 7–28 V", "Power": "150 W AC, 300 W DC", "Cells": "1–6S" },
  },
  {
    name: "ISDT Q8 Max 1000W Charger", brand: "ISDT", cat: "chargers", price: 12999, stock: 6, art: "charger",
    short: "High-power DC charger for big packs and parallel charging.",
    hl: ["1000 W", "30 A", "1–8S"],
    specs: { "Input": "DC 10–34 V", "Power": "1000 W", "Current": "30 A" },
  },
  {
    name: "BetaFPV 6-port 1S Charger (BT2.0 / PH2.0)", brand: "BetaFPV", cat: "chargers", price: 1499, stock: 25, art: "charger",
    short: "USB-C whoop battery charger with storage mode.",
    hl: ["6 ports", "LiPo / LiHV", "Storage mode"],
    specs: { "Input": "USB-C 5 V", "Connectors": "BT2.0, PH2.0" },
  },

  // ───────── Power modules
  {
    name: "Matek 12S Pro BEC 9–55V to 5V/8V/12V 5A", brand: "Matek", cat: "power-modules", price: 2999, mrp: 3499, stock: 12, art: "board",
    short: "Selectable high-voltage BEC for big builds.",
    hl: ["Up to 12S input", "5/8/12 V selectable", "5 A continuous"],
    specs: { "Input": "9–55 V", "Output": "5 / 8 / 12 V", "Current": "5 A" },
  },
  {
    name: "Matek Mini Power Hub with BEC 5V & 12V", brand: "Matek", cat: "power-modules", price: 449, mrp: 499, stock: 40, art: "board",
    short: "Small PDB with dual BEC for simple builds.",
    hl: ["5 V and 12 V", "36 × 36 mm", "Cheap and reliable"],
    specs: { "Input": "2–6S", "Outputs": "5 V 3 A, 12 V 0.5 A" },
  },
  {
    name: "Hobbywing UBEC 3A (2–6S)", brand: "Hobbywing", cat: "power-modules", price: 999, stock: 30, art: "board",
    short: "Switching BEC for servos and accessories.",
    hl: ["3 A", "5 V / 6 V selectable", "2–6S input"],
    specs: { "Input": "2–6S", "Output": "5 / 6 V", "Current": "3 A" },
  },

  // ───────── Cables
  {
    name: "Amass XT60 Connectors (5 pairs)", brand: "Amass", cat: "cables-connectors", price: 349, stock: 100, art: "cable", tags: ["bestseller"],
    short: "Genuine Amass XT60 male/female pairs.",
    hl: ["Genuine Amass", "Gold-plated contacts", "5 pairs"],
    specs: { "Rating": "60 A continuous", "Contents": "5 male + 5 female" },
  },
  {
    name: "BetaFPV BT2.0 Whoop Cable Pigtail", brand: "BetaFPV", cat: "cables-connectors", price: 199, mrp: 299, stock: 80, art: "cable",
    short: "Replacement BT2.0 pigtails for 1S whoops.",
    hl: ["Low resistance", "Pre-soldered lead", "Pack options"],
    specs: { "Connector": "BT2.0", "Wire": "20 AWG" },
    variant: { name: "Pack", options: [
      { label: "1 pc", price: 199, mrp: 299, stock: 50 },
      { label: "5 pcs", price: 999, mrp: 1495, stock: 30 },
    ] },
  },
  {
    name: "Diatone L-Shape USB Adapter V2 (Micro USB)", brand: "Diatone", cat: "cables-connectors", price: 499, stock: 45, art: "cable",
    short: "Right-angle USB adapter for hard-to-reach FC ports.",
    hl: ["Low profile", "Micro USB to Micro USB"],
    specs: { "Type": "Micro USB", "Angle": "90°" },
  },

  // ───────── Action cameras
  {
    name: "GoPro HERO13 Black", brand: "GoPro", cat: "action-cameras", price: 41990, mrp: 45990, stock: 6, art: "actioncam", tags: ["hot"],
    short: "5.3K action camera with HB-series lens mods and GPS.",
    hl: ["5.3K60 / 4K120", "HyperSmooth 6.0", "GPS returns"],
    specs: { "Video": "5.3K60, 4K120", "Photo": "27 MP", "Waterproof": "10 m" },
  },
  {
    name: "DJI Osmo Action 5 Pro", brand: "DJI", cat: "action-cameras", price: 35990, stock: 8, art: "actioncam", tags: ["new"],
    short: "1/1.3-inch action cam with 13.5 stops dynamic range.",
    hl: ["4K/120fps", "47 GB internal storage", "4 h battery"],
    specs: { "Sensor": "1/1.3-inch", "Video": "4K/120fps", "Waterproof": "20 m" },
  },
  {
    name: "Insta360 Ace Pro 2", brand: "Insta360", cat: "action-cameras", price: 44990, stock: 0, art: "actioncam",
    short: "Leica co-engineered action camera with 8K and pure video low light.",
    hl: ["8K30 / 4K60 HDR", "Flip screen", "Dual AI chip"],
    specs: { "Sensor": "1/1.3-inch", "Video": "8K30", "Waterproof": "12 m" },
  },

  // ───────── Gimbal cameras
  {
    name: "SIYI A8 mini 4K 8MP 6X Zoom Gimbal Camera", brand: "SIYI", cat: "gimbal-cameras", price: 25499, mrp: 26999, stock: 7, art: "gimbal", tags: ["bestseller"],
    short: "Tiny 3-axis gimbal with 4K recording and AI-ready Ethernet output.",
    hl: ["3-axis stabilisation", "4K recording", "6× digital zoom"],
    specs: { "Sensor": "8 MP 1/1.7-inch", "Zoom": "6× digital", "Weight": "95 g", "Output": "Ethernet / HDMI" },
  },
  {
    name: "HEQUAV G-Port 3-axis Gimbal for DJI O4 Pro", brand: "HEQUAV", cat: "gimbal-cameras", price: 19499, mrp: 21999, stock: 4, art: "gimbal",
    short: "Stabilised mount for O4 Pro on cinematic FPV builds.",
    hl: ["3-axis", "Direct O4 Pro fit", "Silent motors"],
    specs: { "Axes": "3", "Compatible": "DJI O4 Pro", "Weight": "68 g" },
  },
  {
    name: "Skydroid C12 Pro 4K Dual Light (Day + Thermal) 30X", brand: "Skydroid", cat: "gimbal-cameras", price: 54499, mrp: 59999, stock: 3, art: "gimbal", tags: ["new"],
    short: "Day + thermal gimbal payload with AI tracking for inspection and security.",
    hl: ["Thermal 384 × 288", "30× zoom", "AI object tracking"],
    specs: { "Visible": "4K", "Thermal": "384 × 288", "Zoom": "30×", "Weight": "220 g" },
  },
  {
    name: "Skydroid C14 Pro AI Tracking Day + Thermal + Laser (2026)", brand: "Skydroid", cat: "gimbal-cameras", price: 199999, mrp: 214999, stock: 1, art: "gimbal",
    short: "Tri-sensor gimbal with laser rangefinder for professional inspection.",
    hl: ["Laser rangefinder", "Thermal + day", "AI tracking"],
    specs: { "Sensors": "Day, thermal, laser", "Range finder": "Up to 1200 m", "Weight": "520 g" },
  },

  // ───────── Dev boards
  {
    name: "Raspberry Pi 5 (8GB)", brand: "Raspberry Pi", cat: "dev-boards", price: 8299, stock: 20, art: "board", tags: ["bestseller"],
    short: "Quad-core Cortex-A76 single-board computer for companion computers and projects.",
    hl: ["2.4 GHz Cortex-A76", "PCIe 2.0 x1", "Dual 4K output"],
    specs: { "CPU": "Broadcom BCM2712, 4 × A76", "RAM": "8 GB LPDDR4X", "Power": "5 V 5 A USB-C" },
    variant: { name: "RAM", options: [
      { label: "4GB", price: 5799, stock: 18 },
      { label: "8GB", price: 8299, stock: 20 },
      { label: "16GB", price: 11999, stock: 6 },
    ] },
  },
  {
    name: "ESP32-S3 DevKitC-1 N16R8", brand: "Espressif", cat: "dev-boards", price: 899, stock: 70, art: "board", tags: ["hot"],
    short: "Wi-Fi + BLE dev board with AI vector instructions.",
    hl: ["16 MB flash, 8 MB PSRAM", "Dual USB-C", "Wi-Fi + BLE 5"],
    specs: { "Chip": "ESP32-S3", "Flash": "16 MB", "PSRAM": "8 MB" },
  },
  {
    name: "Arduino Uno R4 WiFi", brand: "Arduino", cat: "dev-boards", price: 2499, stock: 35, art: "board",
    short: "Uno form factor with 32-bit Renesas MCU, Wi-Fi and LED matrix.",
    hl: ["RA4M1 48 MHz", "ESP32-S3 Wi-Fi", "12 × 8 LED matrix"],
    specs: { "MCU": "Renesas RA4M1", "Connectivity": "Wi-Fi, BLE", "Voltage": "5 V" },
  },
  {
    name: "STM32 Nucleo-F446RE", brand: "STMicroelectronics", cat: "dev-boards", price: 2199, stock: 12, art: "board",
    short: "The same family as many flight controllers, ideal for firmware learning.",
    hl: ["180 MHz Cortex-M4", "On-board ST-LINK", "Arduino headers"],
    specs: { "MCU": "STM32F446RE", "Flash": "512 KB", "RAM": "128 KB" },
  },

  // ───────── Sensors & modules
  {
    name: "Benewake TF-Luna LiDAR Range Sensor", brand: "Benewake", cat: "sensors-modules", price: 1899, stock: 25, art: "gps",
    short: "Single-point LiDAR for altitude hold and obstacle sensing.",
    hl: ["0.2–8 m range", "UART / I2C", "250 Hz"],
    specs: { "Range": "0.2–8 m", "Interface": "UART, I2C", "Frame rate": "1–250 Hz" },
  },
  {
    name: "MPU-6050 6-axis IMU Module", brand: "Generic", cat: "sensors-modules", price: 149, stock: 200, art: "gps",
    short: "Accelerometer + gyro module for learning flight control.",
    hl: ["3-axis gyro + accel", "I2C", "3.3–5 V"],
    specs: { "Interface": "I2C", "Gyro range": "±2000 °/s" },
  },
  {
    name: "BME280 Temperature, Humidity & Pressure Sensor", brand: "Generic", cat: "sensors-modules", price: 349, stock: 90, art: "gps",
    short: "Environmental sensor for barometric altitude and weather projects.",
    hl: ["I2C / SPI", "±1 hPa", "Low power"],
    specs: { "Interface": "I2C, SPI", "Pressure": "300–1100 hPa" },
  },

  // ───────── Lab equipment
  {
    name: "Fluke 17B+ Digital Multimeter", brand: "Fluke", cat: "lab-equipment", price: 9999, stock: 6, art: "meter",
    short: "Trustworthy multimeter for builders and technicians.",
    hl: ["CAT III 600 V", "Temperature", "Frequency and capacitance"],
    specs: { "Display": "4000 counts", "Safety": "CAT III 600 V" },
  },
  {
    name: "Owon ODP3012 Bench Power Supply 30V 10A", brand: "Owon", cat: "lab-equipment", price: 11999, stock: 4, art: "meter",
    short: "Programmable bench supply for safe first power-ups.",
    hl: ["30 V / 10 A", "Over-current protection", "USB control"],
    specs: { "Output": "0–30 V, 0–10 A", "Channels": "1" },
  },
  {
    name: "Rigol DHO804 Oscilloscope 70 MHz 4-ch", brand: "Rigol", cat: "lab-equipment", price: 38999, stock: 2, art: "meter", tags: ["new"],
    short: "12-bit 4 channel scope for debugging ESC and signal issues.",
    hl: ["12-bit ADC", "4 channels", "7-inch touch screen"],
    specs: { "Bandwidth": "70 MHz", "Channels": "4", "Resolution": "12-bit" },
  },

  // ───────── Soldering
  {
    name: "Pinecil V2 Smart Soldering Iron", brand: "Pine64", cat: "soldering", price: 3499, stock: 30, art: "iron", tags: ["bestseller"],
    short: "Portable USB-C / DC iron that heats in seconds, perfect for field repairs.",
    hl: ["Up to 88 W on 24 V", "USB-C PD", "Open-source firmware"],
    specs: { "Power": "Up to 88 W", "Input": "USB-C PD / DC 12–24 V", "Tip": "TS100 style" },
  },
  {
    name: "TS101 Smart Soldering Iron", brand: "Miniware", cat: "soldering", price: 6499, stock: 10, art: "iron",
    short: "Premium smart iron with OLED screen and fast heat-up.",
    hl: ["90 W", "USB-C and DC", "Motion sleep"],
    specs: { "Power": "90 W", "Input": "USB-C PD / DC" },
  },
  {
    name: "Kester 63/37 Rosin Core Solder 0.8mm (100g)", brand: "Kester", cat: "soldering", price: 1299, stock: 50, art: "cable",
    short: "Eutectic leaded solder that flows cleanly on pads and XT60s.",
    hl: ["63/37 eutectic", "Rosin core", "0.8 mm"],
    specs: { "Alloy": "Sn63/Pb37", "Diameter": "0.8 mm", "Weight": "100 g" },
  },

  // ───────── Hand tools
  {
    name: "TBS Hex Driver Set (1.5 / 2.0 / 2.5 / 3.0 mm)", brand: "TBS", cat: "hand-tools", price: 1799, stock: 25, art: "tool",
    short: "Hardened hex drivers sized for drone hardware.",
    hl: ["S2 steel tips", "Ergonomic grips", "4 sizes"],
    specs: { "Sizes": "1.5, 2.0, 2.5, 3.0 mm" },
  },
  {
    name: "Prop Wrench & Nut Driver 8mm/M5", brand: "Generic", cat: "hand-tools", price: 299, stock: 80, art: "tool",
    short: "Field-friendly prop nut tool.",
    hl: ["8 mm socket", "Lightweight", "Keyring hole"],
    specs: { "Socket": "8 mm (M5 nuts)" },
  },

  // ───────── Bags & cases
  {
    name: "Torvol Quad Pitstop Backpack Pro", brand: "Torvol", cat: "bags-cases", price: 14999, stock: 5, art: "bag", tags: ["hot"],
    short: "Backpack that unfolds into a field workstation.",
    hl: ["Carries 2–4 quads", "Unfolds into a mat", "Goggle compartment"],
    specs: { "Capacity": "~35 L", "Material": "Water-resistant nylon" },
  },
  {
    name: "LiPo Safe Bag (Large, 30 × 23 × 18 cm)", brand: "Generic", cat: "bags-cases", price: 899, stock: 60, art: "bag", tags: ["bestseller"],
    short: "Fire-resistant bag for charging and storing LiPos.",
    hl: ["Fiberglass shell", "Large size", "Velcro close"],
    specs: { "Size": "30 × 23 × 18 cm" },
  },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function hashHue(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

export const products: Product[] = seeds.map((s, i) => {
  const opts = s.variant?.options;
  const price = opts ? Math.min(...opts.map((o) => o.price)) : s.price;
  const stock = opts ? opts.reduce((n, o) => n + o.stock, 0) : s.stock;
  const cheapest = opts?.find((o) => o.price === price);
  return {
    id: `p${String(i + 1).padStart(3, "0")}`,
    sku: `EG-${String(i + 1).padStart(4, "0")}`,
    lowStockAt: 5,
    slug: slugify(s.name),
    name: s.name,
    brand: s.brand,
    category: s.cat,
    price,
    mrp: cheapest ? cheapest.mrp : s.mrp,
    stock,
    art: s.art,
    hue: hashHue(s.brand),
    tags: s.tags ?? [],
    short: s.short,
    highlights: s.hl,
    specs: s.specs,
    inBox: s.box,
    variant: s.variant,
    weightG: s.w,
    // Rotate seeds so "new" items are spread across categories.
    addedOrder: (i * 37) % seeds.length,
  };
});
