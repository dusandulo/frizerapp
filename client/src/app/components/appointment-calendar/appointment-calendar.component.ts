import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { AppointmentService } from '../../services/appointment.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import { Appointment } from '../../models/appointment.model';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-appointment-calendar',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './appointment-calendar.component.html',
  styleUrls: ['./appointment-calendar.component.scss'],
})
export class AppointmentCalendarComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    height: 'auto',
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    selectable: false, 
    selectMirror: true,
    eventClick: this.handleEventClick.bind(this),
    events: [],
  };

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit() {
    const start = new Date();
    const end = new Date();
    start.setDate(end.getDate() - 30);
    end.setDate(end.getDate() + 30);
    this.loadAppointments(start.toISOString(), end.toISOString());
  }

  loadAppointments(start: string, end: string): void {
    this.appointmentService.getCalendar(start, end).subscribe((appointments: Appointment[]) => {
      console.log('Appointments from API:', appointments);
      this.calendarOptions = {
        ...this.calendarOptions,
        events: appointments.map((app) => ({
          id: String(app.id),
          title: app.isBooked ? '🔴 Booked' : '🟢 Free',
          start: app.startTime,
          end: app.endTime,
          color: app.isBooked ? '#ff4d4d' : '#3b82f6',
          textColor: '#ffffff',
          extendedProps: { isBooked: app.isBooked },
        })) as EventInput[],
      };
    });
  }

  handleEventClick(info: any): void {
    if (!info.event.extendedProps.isBooked) {
      const isConfirmed = confirm('Are you sure you want to book this appointment?');
      if (isConfirmed) {
        const appointmentId = Number(info.event.id);
        this.appointmentService.bookAppointment(appointmentId).subscribe(() => {
          info.event.setProp('title', '🔴 Booked');
          info.event.setProp('color', '#ff4d4d');
        });
      }
    }
  }
}
