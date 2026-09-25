export interface Room {
  id: string;
  name: string;
  capacity: number;
  roomType: string;
  hourlyRate: number;
  location: string;
  hasProjector?: boolean;
  hasWhiteboard?: boolean;
  hasVideoConference?: boolean;
  isActive?: boolean;
  cleanupTimeMinutes?: number;
}

export interface AdminRoom {
  id: string;
  name: string;
  capacity: number;
  roomType: string;
  hourlyRate: number;
  location: string;
  hasProjector: boolean;
  hasWhiteboard: boolean;
  hasVideoConference: boolean;
  isActive: boolean;
  cleanupTimeMinutes?: number;
}
