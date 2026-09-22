export interface CreateBookingPayload {
  roomId?: string;
  title: string;
  startTime: string;
  endTime: string;
  participantCount: number;
}

export interface BookingItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  participantCount: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  room: {
    id: string;
    name: string;
    location: string;
    roomType: string;
  };
}

export interface CheckAvailabilityPayload {
  roomId: string;
  startTime: string;
  endTime: string;
}
