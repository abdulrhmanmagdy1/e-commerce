import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TokenService } from '../../core/services/token.service';

@Component({
  selector: 'app-account-shell',
  standalone: false,
  templateUrl: './account-shell.component.html',
  styleUrl: './account-shell.component.scss'
})
export class AccountShellComponent {
  private readonly tokenService = inject(TokenService);

  get userName(): string {
    const token = this.tokenService.get();
    if (!token) return 'User';
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || '')) || {};
      return String(payload?.name || 'User');
    } catch {
      return 'User';
    }
  }

  get userInitials(): string {
    const name = this.userName;
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
