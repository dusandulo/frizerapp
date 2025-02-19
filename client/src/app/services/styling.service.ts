import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StylingServices } from '../models/styling-services.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StylingService {
  private apiUrl = environment.apiUrlStylingServices;

  constructor(private http: HttpClient) {}

  getAllServices(): Observable<StylingServices[]> {
    return this.http.get<StylingServices[]>(this.apiUrl);
  }

  getServiceById(id: number): Observable<StylingServices> {
    return this.http.get<StylingServices>(`${this.apiUrl}/${id}`);
  }

  createService(service: StylingServices): Observable<StylingServices> {
    return this.http.post<StylingServices>(`${this.apiUrl}/createservice`, service);
  }

  updateService(id: number, service: StylingServices): Observable<StylingServices> {
    return this.http.put<StylingServices>(`${this.apiUrl}/${id}`, service);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}