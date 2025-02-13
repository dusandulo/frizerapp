import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../models/appointment.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-appointment.component.html',
  styleUrls: ['./create-appointment.component.scss'],
})
export class CreateAppointmentComponent implements OnInit {
  appointmentForm!: FormGroup;
  availableTimes: string[] = [];
  filteredEndTimes: string[] = [];
  stylists: { id: number; name: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.initializeTimeOptions();

    this.appointmentForm = this.fb.group({
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      stylistId: ['', Validators.required],
    });
    this.appointmentForm.get('startTime')?.valueChanges.subscribe(() => {
      this.updateEndTimeOptions();
    });
    this.appointmentService.getStylists().subscribe((data) => {
      this.stylists = data;
    });
  }

  initializeTimeOptions(): void {
    const startHour = 8;
    const endHour = 20; 
    const interval = 30; 

    this.availableTimes = this.generateTimeSlots(startHour, endHour, interval);
    this.filteredEndTimes = [...this.availableTimes];
  }

  generateTimeSlots(startHour: number, endHour: number, interval: number): string[] {
    const times: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += interval) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMin = min.toString().padStart(2, '0');
        times.push(`${formattedHour}:${formattedMin}`);
      }
    }
    return times;
  }

  updateEndTimeOptions(): void {
    const selectedStartTime = this.appointmentForm.get('startTime')?.value;
    this.filteredEndTimes = this.availableTimes.filter(time => time > selectedStartTime);
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      const formValue = this.appointmentForm.value;
      const startDateTime = new Date(`${formValue.startDate}T${formValue.startTime}`).toISOString();
      const endDateTime = new Date(`${formValue.startDate}T${formValue.endTime}`).toISOString();

      const appointment: Appointment = {
        id: 0,
        startTime: startDateTime,
        endTime: endDateTime,
        stylistId: Number(formValue.stylistId),
        isBooked: false,
        clientId: 0,
      };

      this.appointmentService.createAppointment(appointment).subscribe({
        next: (res) => {
          console.log('Appointment created', res);
          this.appointmentForm.reset();
        },
        error: (err) => console.error('Error creating appointment', err),
      });
    }
  }
}
