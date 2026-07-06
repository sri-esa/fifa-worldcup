export const zones = [
  {
    id: "gate-a",
    label: "Gate A",
    type: "entry",
    capacity: 9000,
    occupancy: 5200,
    waitMinutes: 8,
    accessible: true,
    nearby: ["north-stand", "medical-1", "metro-plaza"]
  },
  {
    id: "gate-b",
    label: "Gate B",
    type: "entry",
    capacity: 7000,
    occupancy: 6650,
    waitMinutes: 24,
    accessible: true,
    nearby: ["east-concourse", "concession-12", "bus-loop"]
  },
  {
    id: "gate-c",
    label: "Gate C",
    type: "entry",
    capacity: 8500,
    occupancy: 4600,
    waitMinutes: 6,
    accessible: false,
    nearby: ["south-stand", "family-zone", "tram-stop"]
  },
  {
    id: "north-stand",
    label: "North Stand",
    type: "seating",
    capacity: 18000,
    occupancy: 14100,
    waitMinutes: 3,
    accessible: true,
    nearby: ["gate-a", "medical-1", "restroom-n2"]
  },
  {
    id: "east-concourse",
    label: "East Concourse",
    type: "concourse",
    capacity: 12000,
    occupancy: 11150,
    waitMinutes: 18,
    accessible: true,
    nearby: ["gate-b", "concession-12", "restroom-e1"]
  },
  {
    id: "south-stand",
    label: "South Stand",
    type: "seating",
    capacity: 16000,
    occupancy: 9800,
    waitMinutes: 4,
    accessible: false,
    nearby: ["gate-c", "family-zone", "tram-stop"]
  },
  {
    id: "medical-1",
    label: "Medical Point 1",
    type: "service",
    capacity: 120,
    occupancy: 82,
    waitMinutes: 5,
    accessible: true,
    nearby: ["gate-a", "north-stand", "restroom-n2"]
  },
  {
    id: "concession-12",
    label: "Concession 12",
    type: "service",
    capacity: 650,
    occupancy: 610,
    waitMinutes: 17,
    accessible: true,
    nearby: ["gate-b", "east-concourse", "restroom-e1"]
  },
  {
    id: "family-zone",
    label: "Family Zone",
    type: "service",
    capacity: 1400,
    occupancy: 760,
    waitMinutes: 2,
    accessible: true,
    nearby: ["gate-c", "south-stand", "tram-stop"]
  },
  {
    id: "metro-plaza",
    label: "Metro Plaza",
    type: "transport",
    capacity: 15000,
    occupancy: 9200,
    waitMinutes: 12,
    accessible: true,
    nearby: ["gate-a", "north-stand"]
  },
  {
    id: "bus-loop",
    label: "Bus Loop",
    type: "transport",
    capacity: 10000,
    occupancy: 8900,
    waitMinutes: 20,
    accessible: true,
    nearby: ["gate-b", "east-concourse"]
  },
  {
    id: "tram-stop",
    label: "Tram Stop",
    type: "transport",
    capacity: 11000,
    occupancy: 5200,
    waitMinutes: 9,
    accessible: true,
    nearby: ["gate-c", "south-stand", "family-zone"]
  }
];

export const initialReports = [
  {
    id: "R-1024",
    text: "Long queue building near Gate B and some fans are asking for another entry route.",
    source: "Volunteer Mira",
    minute: "18:42"
  },
  {
    id: "R-1025",
    text: "Wheelchair user needs step-free route from Metro Plaza to North Stand.",
    source: "Fan assistant",
    minute: "18:45"
  },
  {
    id: "R-1026",
    text: "Concession 12 is running low on water bottles and the line is blocking the concourse.",
    source: "Vendor lead",
    minute: "18:48"
  }
];

export const languages = {
  en: {
    label: "English",
    greeting: "I can help with gates, seats, accessible routes, transport, and urgent assistance."
  },
  es: {
    label: "Spanish",
    greeting: "Puedo ayudar con puertas, asientos, rutas accesibles, transporte y asistencia urgente."
  },
  fr: {
    label: "French",
    greeting: "Je peux aider avec les portes, les sieges, les trajets accessibles, le transport et l'aide urgente."
  },
  hi: {
    label: "Hindi",
    greeting: "Main gates, seats, accessible routes, transport aur urgent help mein madad kar sakta hoon."
  }
};
