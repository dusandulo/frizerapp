import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  clients: any[] = [];
  stylists: any[] = [];
  selectedUser: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUsers().subscribe(users => {
      this.users = users;
      this.clients = this.users.filter(user => user.role === 0);
      this.stylists = this.users.filter(user => user.role === 2);
    });
  }

  openUserModal(user: any): void {
    this.selectedUser = user;
  }

  closeUserModal(): void {
    this.selectedUser = null;
  }
}