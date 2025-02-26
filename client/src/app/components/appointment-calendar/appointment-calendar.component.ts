import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-appointment-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-calendar.component.html',
  styleUrls: ['./appointment-calendar.component.scss'],
})
export class AppointmentCalendarComponent implements OnInit {
  appointments: Appointment[] = [];
  stylists: { id: number; name: string }[] = [];
  selectedDate: Date = new Date();
  days: Date[] = [];
  isLoading: boolean = false;

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.generateDays();
    this.loadStylists();
    this.loadAppointments();
  }

  generateDays(): void {
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      this.days.push(date);
    }
  }

  loadAppointments(): void {
    this.isLoading = true;
    const start = new Date(this.selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(this.selectedDate);
    end.setDate(end.getDate() + 7);
    end.setHours(23, 59, 59, 999);

    this.appointmentService.getCalendar(start.toISOString(), end.toISOString()).subscribe({
      next: (appointments) => {
        this.appointments = appointments.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading appointments:', err);
        this.isLoading = false;
      }
    });
  }

  loadStylists(): void {
    this.appointmentService.getStylists().subscribe({
      next: (stylists) => {
        this.stylists = stylists;
      },
      error: (err) => {
        console.error('Error loading stylists:', err);
      }
    });
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    this.loadAppointments();
  }

  getAppointmentsForStylistAndDate(stylistId: number, date: Date): Appointment[] {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.appointments.filter(
      app => app.stylistId === stylistId &&
             new Date(app.startTime) >= startOfDay &&
             new Date(app.endTime) <= endOfDay
    );
  }
}