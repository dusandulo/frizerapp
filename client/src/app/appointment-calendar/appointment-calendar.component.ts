import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { AppointmentService } from '../services/appointment.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import { Appointment } from '../models/appointment.model';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-appointment-calendar',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './appointment-calendar.component.html',
  styleUrls: ['./appointment-calendar.component.scss']
})
export class AppointmentCalendarComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    height: 500,
    events: [],
    selectable: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this)
  };

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit() {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 30);
    this.loadAppointments(start.toISOString(), end.toISOString());
  }

  loadAppointments(start: string, end: string): void {
    this.appointmentService.getCalendar(start, end).subscribe((appointments: Appointment[]) => {
      this.calendarOptions = { 
        ...this.calendarOptions,
        events: appointments.map((app) => ({
          id: String(app.id),
          title: app.isBooked ? 'Booked' : 'Free',
          start: app.startTime,
          end: app.endTime,
          color: app.isBooked ? '#ff0000' : '#00ff00',
          extendedProps: { isBooked: app.isBooked },
        })) as EventInput[],
      };
    });
  }

  handleDateSelect(selectInfo: any): void {
    console.log('Date selected', selectInfo);
  }

  handleEventClick(info: any): void {
    if (!info.event.extendedProps.isBooked) {
      const appointmentId = Number(info.event.id);
      this.appointmentService.bookAppointment(appointmentId).subscribe(() => {
        info.event.setProp('title', 'Booked');
        info.event.setProp('color', '#ff0000');
      });
    }
  }
}
