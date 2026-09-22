import { httpClient } from '../lib/httpClient';
import type { BookingItem, CreateBookingPayload, CheckAvailabilityPayload } from '../types/booking';

export const bookingRequest = {
  create: (payload: CreateBookingPayload) =>
    httpClient.post<BookingItem>('/Bookings', payload, { authenticated: true }),

  getMyBookings: () =>
    httpClient.get<BookingItem[]>('/Bookings/my-bookings', { authenticated: true }),

  cancel: (bookingId: string) =>
    httpClient.put<string>(`/Bookings/${bookingId}/cancel`, undefined, { authenticated: true }),

  checkAvailability: (payload: CheckAvailabilityPayload) =>
    httpClient.post<boolean>('/Bookings/check-availability', payload),
};
