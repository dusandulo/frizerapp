import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentCalendarComponent } from '../appointment-calendar/appointment-calendar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AppointmentCalendarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  
}