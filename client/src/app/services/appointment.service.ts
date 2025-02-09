import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Appointment } from '../models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = environment.apiUrlAppointmets;

  constructor(private http: HttpClient) {}

  getCalendar(start: string, end: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      `${this.apiUrl}/calendar?start=${start}&end=${end}`
    );
  }

  bookAppointment(appointmentId: number): Observable<Appointment> {
    return this.http.post<Appointment>(
      `${this.apiUrl}/book/${appointmentId}`,
      {}
    );
  }

  getAppointmentsForStylist(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/stylist`);
  }

  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/create`, appointment);
  }
}