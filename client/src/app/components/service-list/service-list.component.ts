import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StylingService } from '../../services/styling.service';
import { StylingServices } from '../../models/styling-services.model';
import { EditServiceModalComponent } from '../edit-service-modal/edit-service-modal.component';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, EditServiceModalComponent],
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss']
})
export class ServiceListComponent implements OnInit {
  services: StylingServices[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;
  selectedService: StylingServices | null = null;
  isEditModalOpen: boolean = false;

  constructor(private stylingService: StylingService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.stylingService.getAllServices().subscribe({
      next: (services) => {
        this.services = services;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load services.';
        console.error('Load services error:', error);
      }
    });
  }

  deleteService(id: number): void {
    if (confirm('Are you sure you want to delete this service?')) {
      this.stylingService.deleteService(id).subscribe({
        next: () => {
          this.successMessage = 'Service deleted successfully!';
          this.loadServices();
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete service.';
          console.error('Delete service error:', error);
        }
      });
    }
  }

  openEditModal(service: StylingServices): void {
    this.selectedService = service;
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedService = null;
  }

  saveService(updatedService: StylingServices): void {
    this.stylingService.updateService(updatedService.id, updatedService).subscribe({
      next: () => {
        this.successMessage = 'Service updated successfully!';
        this.loadServices();
        this.closeEditModal();
      },
      error: (error) => {
        this.errorMessage = 'Failed to update service.';
        console.error('Update service error:', error);
      }
    });
  }
}