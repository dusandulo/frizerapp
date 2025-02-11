import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentCalendarComponent } from '../appointment-calendar/appointment-calendar.component';
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AppointmentCalendarComponent, FooterComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  
}