import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { CreateAppointmentComponent } from './components/create-appointment/create-appointment.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { CreateServiceComponent } from './components/create-service/create-service.component';
import { BookAppointmentComponent } from './components/book-appointment/book-appointment.component';
import { AppointmentHistoryComponent } from './components/appointment-history/appointment-history.component';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', redirectTo: 'login', pathMatch: 'full' }],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'edit-profile',
    component: EditProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile-page',
    component: ProfilePageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'users',
    component: UserListComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'create-appointment',
    component: CreateAppointmentComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'create-service',
    component: CreateServiceComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'book-appointment',
    component: BookAppointmentComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'appointment-history',
    component: AppointmentHistoryComponent,
    canActivate: [AuthGuard],
  },

  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth' },
];
