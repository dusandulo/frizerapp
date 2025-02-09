export interface Appointment {
  id: number;
  startTime: string;
  endTime: string;
  clientId?: number;
  stylistId: number;
  isBooked: boolean;
}