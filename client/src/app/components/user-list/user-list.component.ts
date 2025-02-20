import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  imports: [CommonModule]
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  selectedUser: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  openUserModal(user: any): void {
    this.selectedUser = user;
  }

  closeUserModal(): void {
    this.selectedUser = null;
  }
}
