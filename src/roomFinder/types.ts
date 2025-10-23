export interface Building {
  id: number;
  name: string;
}

export interface Room {
  id: number;
  buildingId: number;
  building: Building;
  number: string;
  description: string;
}

export interface Event {
  id: number;
  roomId: number;
  room: Room;
  name: string;
  days: string; // JSON array of days: ["M", "T", "W", "Th", "F", "Sa", "Su"]
  startTime: string; // TIME format: "HH:MM:SS"
  endTime: string; // TIME format: "HH:MM:SS"
}

export interface RoomSearchParams {
  building?: string;
  room?: string;
  timeType: 'now' | 'when' | 'at' | 'between';
  timeA?: string; // For 'at' and 'between' types
  timeB?: string; // For 'between' type
  days: string[]; // Array of day abbreviations
}

export interface RoomAvailabilityResult {
  roomNumber: string;
  buildingName: string;
}

export interface EventInfo {
  name: string;
  startTime: string;
  endTime: string;
}

export const DAY_MAP: Record<string, string> = {
  'Mon': 'M',
  'Tue': 'T',
  'Wed': 'W',
  'Thu': 'Th',
  'Fri': 'F',
  'Sat': 'Sa',
  'Sun': 'Su',
};

export const REVERSE_DAY_MAP: Record<string, string> = {
  'M': 'Mon',
  'T': 'Tue',
  'W': 'Wed',
  'Th': 'Thu',
  'F': 'Fri',
  'Sa': 'Sat',
  'Su': 'Sun',
};
