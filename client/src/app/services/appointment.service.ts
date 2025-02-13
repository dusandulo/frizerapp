import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Appointment } from '../models/appointment.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = environment.apiUrlAppointmets;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getCalendar(start: string, end: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      `${this.apiUrl}/calendar?start=${start}&end=${end}`
    );
  }

  bookAppointment(appointmentId: number): Observable<Appointment> {
    const token = this.authService.getToken();

    if (!token) {
      console.error('No token found. User might not be logged in.');
      return new Observable<Appointment>();
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<Appointment>(
      `${this.apiUrl}/book/${appointmentId}`,
      {},
      { headers: headers }
    );
  }

  getAppointmentsForStylist(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/stylist`);
  }

  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/create`, appointment);
  }
  getStylists(): Observable<{ id: number; name: string }[]> {
    return this.http.get<{ id: string; name: string }[]>(`${this.apiUrl}/getstylists`).pipe(
      map(stylists => stylists.map(s => ({ id: Number(s.id), name: s.name })))
    );
  }
}