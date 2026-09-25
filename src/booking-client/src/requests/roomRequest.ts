import { httpClient } from "../lib/httpClient";
import type { Room } from "../types/room";

export const roomRequest = {
  getAll: () => httpClient.get<Room[]>("/Rooms"),

  getById: (id: string) => httpClient.get<Room>(`/Rooms/${id}`),

  getOccupiedSlots: (roomId: string, date: string) =>
    httpClient.get<OccupiedSlotsResponse>(
      `/Rooms/${roomId}/occupied-slots?date=${date}`,
    ),
};

export interface OccupiedSlot {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  blockedUntil: string;
}

export interface OccupiedSlotsResponse {
  date: string;
  cleanupTimeMinutes: number;
  occupiedSlots: OccupiedSlot[];
}
