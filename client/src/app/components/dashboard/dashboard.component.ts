import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentCalendarComponent } from '../appointment-calendar/appointment-calendar.component';
import { BookAppointmentComponent } from '../book-appointment/book-appointment.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AppointmentCalendarComponent, BookAppointmentComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  showCalendar: boolean = false;
  showBooking: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        const role = user.role;
        this.showCalendar = role === 1 || role === 2;
        this.showBooking = role === 0;
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.showCalendar = false;
        this.showBooking = false;
      }
    });
  }
}