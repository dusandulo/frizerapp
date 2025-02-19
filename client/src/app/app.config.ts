import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthGuard } from './guards/auth.guard';
import { FullCalendarModule } from '@fullcalendar/angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient(), AuthGuard, FullCalendarModule]
};
