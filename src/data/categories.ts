import type { Category, Department } from "@/lib/types";

export const departments: Department[] = [
  { slug: "drones", name: "Drones" },
  { slug: "fpv", name: "FPV systems" },
  { slug: "parts", name: "Build parts" },
  { slug: "radio", name: "Radio & links" },
  { slug: "power", name: "Power" },
  { slug: "cameras", name: "Cameras & gimbals" },
  { slug: "electronics", name: "Electronics" },
  { slug: "tools", name: "Tools & gear" },
];

export const categories: Category[] = [
  { slug: "fpv-drones", name: "FPV drones", department: "drones", art: "quad", blurb: "Ready-to-fly, bind-and-fly and plug-and-play quads from 3 to 10 inch." },
  { slug: "whoops-micro", name: "Whoops & micro", department: "drones", art: "whoop", blurb: "Indoor-safe tiny whoops and cinewhoops to learn and film with." },
  { slug: "camera-drones", name: "Camera drones", department: "drones", art: "camdrone", blurb: "GPS camera drones for aerial photography and mapping." },
  { slug: "vtol-fixed-wing", name: "VTOL & fixed wing", department: "drones", art: "wing", blurb: "Long-endurance planes, flying wings and VTOL airframes." },
  { slug: "industrial-drones", name: "Industrial & agri", department: "drones", art: "camdrone", blurb: "Payload, survey and spraying platforms with ground stations." },

  { slug: "goggles", name: "FPV goggles", department: "fpv", art: "goggles", blurb: "Digital and analog goggles from DJI, Walksnail, HDZero and Fat Shark." },
  { slug: "air-units", name: "Air units & VTX", department: "fpv", art: "airunit", blurb: "Digital air units and analog video transmitters." },
  { slug: "fpv-cameras", name: "FPV cameras", department: "fpv", art: "fpvcam", blurb: "Low-latency analog and digital FPV cameras." },
  { slug: "antennas", name: "Antennas", department: "fpv", art: "antenna", blurb: "Omni, patch and helical antennas for video and control links." },

  { slug: "frames", name: "Frames", department: "parts", art: "frame", blurb: "Carbon fibre frames for freestyle, racing, cinematic and long range." },
  { slug: "motors", name: "Motors", department: "parts", art: "motor", blurb: "Brushless motors from 0802 whoop motors to heavy-lift outrunners." },
  { slug: "escs", name: "ESCs", department: "parts", art: "esc", blurb: "4-in-1 and single ESCs, BLHeli_32, AM32 and Bluejay." },
  { slug: "flight-controllers", name: "Flight controllers", department: "parts", art: "board", blurb: "F4, F7 and H7 flight controllers and stacks for Betaflight, iNav and ArduPilot." },
  { slug: "propellers", name: "Propellers", department: "parts", art: "prop", blurb: "Props for whoops, 5 inch freestyle, long range and heavy lift." },
  { slug: "gps-sensors", name: "GPS & sensors", department: "parts", art: "gps", blurb: "GNSS modules, compasses, airspeed and rangefinders." },

  { slug: "radios", name: "Radio controllers", department: "radio", art: "radio", blurb: "ELRS, Crossfire and multi-protocol transmitters." },
  { slug: "receivers", name: "Receivers", department: "radio", art: "receiver", blurb: "ExpressLRS, TBS and Ghost receivers in every size." },
  { slug: "long-range", name: "Telemetry & long range", department: "radio", art: "receiver", blurb: "Telemetry radios, TX modules and long-range links." },

  { slug: "batteries", name: "Batteries", department: "power", art: "battery", blurb: "LiPo, LiHV and Li-ion packs from 1S to 12S." },
  { slug: "chargers", name: "Chargers", department: "power", art: "charger", blurb: "Smart AC/DC chargers, parallel boards and storage tools." },
  { slug: "power-modules", name: "BECs & power", department: "power", art: "board", blurb: "BECs, PDBs, power modules and current sensors." },
  { slug: "cables-connectors", name: "Cables & connectors", department: "power", art: "cable", blurb: "XT30, XT60, XT90, pigtails, silicone wire and adapters." },

  { slug: "action-cameras", name: "Action cameras", department: "cameras", art: "actioncam", blurb: "GoPro, DJI and Insta360 cameras and naked builds." },
  { slug: "gimbal-cameras", name: "Gimbal & thermal", department: "cameras", art: "gimbal", blurb: "Zoom, thermal and dual-sensor gimbal payloads." },

  { slug: "dev-boards", name: "Dev boards", department: "electronics", art: "board", blurb: "Arduino, ESP32, Raspberry Pi and STM32 boards." },
  { slug: "sensors-modules", name: "Sensors & modules", department: "electronics", art: "gps", blurb: "IMUs, LiDAR, distance, environment and radio modules." },
  { slug: "lab-equipment", name: "Lab equipment", department: "electronics", art: "meter", blurb: "Multimeters, bench supplies and oscilloscopes." },

  { slug: "soldering", name: "Soldering", department: "tools", art: "iron", blurb: "Smart irons, stations, solder, flux and fume extraction." },
  { slug: "hand-tools", name: "Hand tools", department: "tools", art: "tool", blurb: "Hex drivers, prop tools, nut drivers and build mats." },
  { slug: "bags-cases", name: "Bags & cases", department: "tools", art: "bag", blurb: "Backpacks, hard cases and LiPo-safe bags." },
];

export const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
export const departmentBySlug = new Map(departments.map((d) => [d.slug, d]));

export function categoriesIn(department: string) {
  return categories.filter((c) => c.department === department);
}
