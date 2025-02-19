import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StylingServices } from '../../models/styling-services.model';

@Component({
  selector: 'app-edit-service-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-service-modal.component.html',
  styleUrls: ['./edit-service-modal.component.scss']
})
export class EditServiceModalComponent implements OnInit {
  @Input() service: StylingServices | null = null;
  @Output() save = new EventEmitter<StylingServices>();
  @Output() cancel = new EventEmitter<void>();

  editForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      type: [this.service?.type || '', Validators.required],
      price: [this.service?.price || 0, [Validators.required, Validators.min(0)]]
    });
  }

  onSave(): void {
    if (this.editForm.valid && this.service) {
      const updatedService: StylingServices = {
        id: this.service.id,
        type: this.editForm.value.type,
        price: this.editForm.value.price
      };
      this.save.emit(updatedService);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}