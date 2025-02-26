import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { Appointment } from '../../models/appointment.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-appointment-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './appointment-history.component.html',
  styleUrls: ['./appointment-history.component.scss'],
})
export class AppointmentHistoryComponent implements OnInit {
  pastAppointments: Appointment[] = [];
  upcomingAppointments: Appointment[] = [];
  isLoading: boolean = false;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        const clientId = user.id;
        this.appointmentService.getAppointmentsByClient(clientId).subscribe({
          next: (appointments) => {
            const now = new Date();
            this.pastAppointments = appointments.filter(
              (app) => new Date(app.endTime) < now
            );
            this.upcomingAppointments = appointments.filter(
              (app) => new Date(app.startTime) >= now
            );
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error loading appointments:', err);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.isLoading = false;
      }
    });
  }
}