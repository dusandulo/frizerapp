import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { StylingService } from '../../services/styling.service';
import { Appointment } from '../../models/appointment.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.scss'],
})
export class BookAppointmentComponent implements OnInit {
  availableDates: Date[] = [];
  selectedDate: Date | null = null;
  services: any[] = [];
  selectedServiceId: number | null = null;
  stylists: { id: number; name: string }[] = [];
  availableSlots: Appointment[] = [];
  selectedSlot: Appointment | null = null;
  isLoading: boolean = false;
  showBookingModal: boolean = false;
  bookingConfirmed: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private stylingService: StylingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDates();
    this.loadServices();
    this.loadStylists();
  }

  loadDates(): void {
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      this.availableDates.push(date);
    }
  }

  loadServices(): void {
    this.stylingService.getAllServices().subscribe({
      next: (services) => {
        console.log('Services loaded:', services);
        this.services = services;
        if (services.length === 0) {
          console.warn('No services returned from API');
        }
      },
      error: (err) => {
        console.error('Error loading services:', err);
      }
    });
  }

  loadStylists(): void {
    this.appointmentService.getStylists().subscribe({
      next: (stylists) => {
        console.log('Stylists loaded:', stylists);
        this.stylists = stylists;
      },
      error: (err) => {
        console.error('Error loading stylists:', err);
      }
    });
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    this.selectedSlot = null;
    this.loadAvailableSlots();
  }

  selectService(serviceId: number): void {
    this.selectedServiceId = serviceId;
    this.selectedSlot = null;
    this.loadAvailableSlots();
  }

  loadAvailableSlots(): void {
    if (!this.selectedDate || this.selectedServiceId === null) return;

    const selectedService = this.services.find(s => s.id === this.selectedServiceId);
    if (!selectedService) return;

    const duration = selectedService.duration;
    const slotsNeeded = Math.ceil(duration / 20);

    const start = new Date(this.selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(this.selectedDate);
    end.setHours(23, 59, 59, 999);

    this.isLoading = true;
    this.appointmentService.getCalendar(start.toISOString(), end.toISOString()).subscribe({
      next: (slots) => {
        console.log('All slots:', slots);
        const sortedSlots = slots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        this.availableSlots = this.filterAvailableSlots(sortedSlots, slotsNeeded);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading slots:', err);
        this.isLoading = false;
      }
    });
  }

  filterAvailableSlots(slots: Appointment[], slotsNeeded: number): Appointment[] {
    const available: Appointment[] = [];
    for (let i = 0; i <= slots.length - slotsNeeded; i++) {
      const startSlot = slots[i];
      if (startSlot.isBooked) continue;

      let isConsecutiveAvailable = true;
      for (let j = 1; j < slotsNeeded; j++) {
        const nextSlot = slots[i + j];
        const expectedNextStart = new Date(startSlot.startTime);
        expectedNextStart.setMinutes(expectedNextStart.getMinutes() + 20 * j);

        if (!nextSlot || nextSlot.isBooked || new Date(nextSlot.startTime).getTime() !== expectedNextStart.getTime()) {
          isConsecutiveAvailable = false;
          break;
        }
      }

      if (isConsecutiveAvailable) {
        available.push(startSlot);
      }
    }
    return available;
  }

  getAvailableSlotsForStylist(stylistId: number): Appointment[] {
    return this.availableSlots.filter(slot => slot.stylistId === stylistId);
  }

  selectSlot(slot: Appointment): void {
    this.selectedSlot = slot;
  }

  bookAppointment(): void {
    if (!this.selectedSlot || this.selectedServiceId === null) return;

    this.showBookingModal = true;
    this.isLoading = true;
    this.bookingConfirmed = false;

    const selectedService = this.services.find(s => s.id === this.selectedServiceId);
    const duration = selectedService.duration;
    const slotsToBook = this.getSlotsToBook(this.selectedSlot, duration);

    const bookingData = {
      appointmentIds: slotsToBook.map(slot => slot.id),
      stylingServiceId: this.selectedServiceId
    };

    this.appointmentService.bookAppointmentsWithService(bookingData).subscribe({
      next: (responses) => {
        console.log('Appointments booked:', responses);
        this.isLoading = false;
        this.bookingConfirmed = true;

        setTimeout(() => {
          this.showBookingModal = false;
          this.resetForm();
          this.router.navigate(['/appointment-history']);
        }, 2000);
      },
      error: (err) => {
        console.error('Booking error:', err);
        this.isLoading = false;
        this.showBookingModal = false;
        this.errorMessage = 'Failed to book appointment. Please try again.';
      }
    });
  }

  getSlotsToBook(startSlot: Appointment, duration: number): Appointment[] {
    const slotsToBook: Appointment[] = [startSlot];
    const slotsNeeded = Math.ceil(duration / 20) - 1;

    for (let i = 0; i < slotsNeeded; i++) {
      const nextSlot = this.availableSlots.find(slot => {
        const expectedTime = new Date(startSlot.startTime);
        expectedTime.setMinutes(expectedTime.getMinutes() + 20 * (i + 1));
        return slot.stylistId === startSlot.stylistId && new Date(slot.startTime).getTime() === expectedTime.getTime();
      });
      if (nextSlot) {
        slotsToBook.push(nextSlot);
      }
    }
    return slotsToBook;
  }

  resetForm(): void {
    this.selectedDate = null;
    this.selectedServiceId = null;
    this.selectedSlot = null;
    this.availableSlots = [];
    this.errorMessage = null;
  }
}