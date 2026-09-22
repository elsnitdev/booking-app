import { httpClient } from '../lib/httpClient';
import type { Room } from '../types/room';

export const roomRequest = {
  getAll: () =>
    httpClient.get<Room[]>('/Rooms'),

  getById: (id: string) =>
    httpClient.get<Room>(`/Rooms/${id}`),
};
