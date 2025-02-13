import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { AppointmentService } from '../../services/appointment.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import { Appointment } from '../../models/appointment.model';
import { CommonModule } from '@angular/common';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';

@Component({
  selector: 'app-appointment-calendar',
  standalone: true,
  imports: [FullCalendarModule, CommonModule],
  templateUrl: './appointment-calendar.component.html',
  styleUrls: ['./appointment-calendar.component.scss'],
})
export class AppointmentCalendarComponent implements OnInit {
  showBookingModal = false;
  selectedEvent: any = null;
  
  calendarOptions: CalendarOptions = {
    initialView: 'resourceTimeGridDay',
    schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives', // Free version for development
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, resourceTimeGridPlugin],
    resources: [],
    events: [],
    eventOverlap: false,
    slotEventOverlap: false,
    height: 'auto',
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    selectable: false,
    allDaySlot: false,
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short'
    },
    eventClassNames: 'cursor-pointer hover:opacity-70 transition-opacity',
    eventClick: this.handleEventClick.bind(this),
  };

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit() {
    const start = new Date();
    const end = new Date();
    start.setDate(end.getDate() - 30);
    end.setDate(end.getDate() + 30);

    this.loadStylists();
    this.loadAppointments(start.toISOString(), end.toISOString());
  }

  loadAppointments(start: string, end: string): void {
    this.appointmentService.getCalendar(start, end).subscribe((appointments: Appointment[]) => {
      console.log('Appointments from API:', appointments);
      this.calendarOptions = {
        ...this.calendarOptions,
        events: appointments.map((app) => ({
          id: String(app.id),
          title: `${app.isBooked ? '🔴 BOOKED' : '🟢 FREE'}`,
          start: app.startTime,
          end: app.endTime,
          resourceId: String(app.stylistId),
          color: app.isBooked ? '#ff4d4d' : '#3b82f6',
          textColor: '#ffffff',
        })) as EventInput[],
      };
    });
  }
  

  loadStylists(): void {
    this.appointmentService.getStylists().subscribe((stylists) => {
      this.calendarOptions = {
        ...this.calendarOptions,
        resources: stylists.map(stylist => ({
          id: String(stylist.id),
          title: stylist.name
        }))
      };
    });
  }

  handleEventClick(info: any) {
    this.selectedEvent = info.event;
    if (!info.event.extendedProps.isBooked) {
      this.showBookingModal = true;
    }
  }

  confirmBooking() {
    this.appointmentService.bookAppointment(Number(this.selectedEvent.id))
      .subscribe({
        next: (response) => {
          this.selectedEvent.setExtendedProp('isBooked', true);
          this.selectedEvent.setProp('title', '🔴 Booked');
          this.selectedEvent.setProp('color', '#ff4d4d');
          this.showBookingModal = false;
        },
        error: (error) => {
          console.error('There was an error booking the appointment!', error);
        }
      });
  }
}
