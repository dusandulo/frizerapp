import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { Appointment } from '../../models/appointment.model';
import { Observable } from 'rxjs'; 
import { map } from 'rxjs/operators'; 

@Component({
  selector: 'app-create-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-appointment.component.html',
  styleUrls: ['./create-appointment.component.scss'],
})
export class CreateAppointmentComponent implements OnInit {
  appointmentForm: FormGroup;
  minDate: string;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    this.appointmentForm = this.fb.group({
      date: ['', Validators.required],
      shift: ['', Validators.required],
      breakStartTime: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  selectShift(shift: 'morning' | 'afternoon'): void {
    this.appointmentForm.patchValue({ shift });
  }

  getShiftTimes(): Date[] {
    const shift = this.appointmentForm.get('shift')?.value;
    if (!shift) return [];

    const startHour = shift === 'morning' ? 8 : 14;
    const endHour = shift === 'morning' ? 13 : 19;
    const interval = 20;
    const times: Date[] = [];

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += interval) {
        const time = new Date();
        time.setHours(hour, min, 0, 0);
        times.push(time);
      }
    }
    return times;
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      this.authService.getCurrentUser().subscribe({
        next: (user) => {
          const stylistId = user.id;
          const formValue = this.appointmentForm.value;
          const selectedDate = new Date(formValue.date);

          this.checkExistingAppointments(selectedDate, formValue.shift, stylistId).subscribe({
            next: (existingAppointments: Appointment[]) => { 
              if (existingAppointments.length > 0) {
                this.errorMessage = 'Appointments for this date and shift already exist.';
                this.isLoading = false;
                return;
              }

              const breakStartTime = new Date(formValue.breakStartTime);
              const appointments: Appointment[] = this.generateAppointments(selectedDate, formValue.shift, stylistId, breakStartTime);
              this.createMultipleAppointments(appointments);
            },
            error: (err: any) => { 
              this.errorMessage = 'Failed to check existing appointments.';
              console.error('Error checking appointments:', err);
              this.isLoading = false;
            }
          });
        },
        error: (err: any) => { 
          this.errorMessage = 'Failed to identify stylist. Please log in again.';
          console.error('Error fetching current user:', err);
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = 'Please fill all required fields.';
    }
  }

  checkExistingAppointments(date: Date, shift: 'morning' | 'afternoon', stylistId: number): Observable<Appointment[]> {
    const start = new Date(date);
    start.setHours(shift === 'morning' ? 8 : 14, 0, 0, 0);
    const end = new Date(date);
    end.setHours(shift === 'morning' ? 14 : 20, 0, 0, 0);

    return this.appointmentService.getCalendar(start.toISOString(), end.toISOString()).pipe(
      map((appointments: Appointment[]) => appointments.filter((app: Appointment) => app.stylistId === stylistId))
    );
  }

  generateAppointments(date: Date, shift: 'morning' | 'afternoon', stylistId: number, breakStartTime: Date): Appointment[] {
    const appointments: Appointment[] = [];
    const startHour = shift === 'morning' ? 9 : 15;
    const endHour = shift === 'morning' ? 15 : 21;
    const interval = 20;

    const breakEndTime = new Date(breakStartTime);
    breakEndTime.setMinutes(breakEndTime.getMinutes() + 40);

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += interval) {
        const startTime = new Date(date);
        startTime.setHours(hour, min, 0, 0);
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + interval);

        const startTimeMs = startTime.getTime();
        const breakStartMs = breakStartTime.getTime();
        const breakEndMs = breakEndTime.getTime();

        if (startTimeMs >= breakStartMs && startTimeMs < breakEndMs) {
          continue;
        }

        appointments.push({
          id: 0,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          stylistId: stylistId,
          isBooked: false,
          clientId: undefined
        });
      }
    }
    return appointments;
  }

  createMultipleAppointments(appointments: Appointment[]): void {
    let completed = 0;
    const total = appointments.length;

    appointments.forEach((appointment) => {
      this.appointmentService.createAppointment(appointment).subscribe({
        next: (res) => {
          completed++;
          console.log('Appointment created:', res);
          if (completed === total) {
            this.successMessage = 'All appointments created successfully!';
            this.appointmentForm.reset();
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.errorMessage = 'Failed to create some appointments.';
          console.error('Error creating appointment:', err);
          this.isLoading = false;
        }
      });
    });
  }
}