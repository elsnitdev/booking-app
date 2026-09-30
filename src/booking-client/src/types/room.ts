export interface RoomImage {
  id: string;
  imageUrl: string;
  caption?: string;
  tag?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface RoomAmenity {
  id: string;
  name: string;
  category: string;
  icon: string;
  description?: string;
  customNote?: string;
  quantity: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  roomType: string;
  hourlyRate: number;
  location: string;
  description?: string;
  coverImageUrl?: string;
  hasProjector?: boolean;
  hasWhiteboard?: boolean;
  hasVideoConference?: boolean;
  isActive?: boolean;
  cleanupTimeMinutes?: number;
  images?: RoomImage[];
  amenities?: RoomAmenity[];
}

export interface AdminRoom {
  id: string;
  name: string;
  capacity: number;
  roomType: string;
  hourlyRate: number;
  location: string;
  description?: string;
  coverImageUrl?: string;
  hasProjector: boolean;
  hasWhiteboard: boolean;
  hasVideoConference: boolean;
  isActive: boolean;
  cleanupTimeMinutes?: number;
  images?: RoomImage[];
  amenities?: RoomAmenity[];
}
