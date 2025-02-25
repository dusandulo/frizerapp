import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StylingService } from '../../services/styling.service';
import { Router } from '@angular/router';
import { ServiceListComponent } from '../service-list/service-list.component';

@Component({
  selector: 'app-create-service',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ServiceListComponent],
  templateUrl: './create-service.component.html',
  styleUrls: ['./create-service.component.scss']
})
export class CreateServiceComponent implements OnInit {
  serviceForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private stylingService: StylingService,
    private router: Router
  ) {
    this.serviceForm = this.fb.group({
      type: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      duration: [null, Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.serviceForm.valid) {
      const serviceData = this.serviceForm.value;
      this.stylingService.createService(serviceData).subscribe({
        next: (res) => {
          this.successMessage = 'Service created successfully!';
          setTimeout(() => {
            this.successMessage = null;
            window.location.reload(); 
          }, 1000);
        },
        error: (err) => {
          this.errorMessage = 'Failed to create service.';
          console.error('Create service error:', err);
        }
      });
    } else {
      this.errorMessage = 'Please fill all required fields correctly.';
    }
  }
}