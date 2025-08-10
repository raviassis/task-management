import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex justify-between items-center mb-6">
    @if (user) {
      <div>
        <h1 class="text-2xl font-semibold text-gray-800">Welcome, {{ user.name }}</h1>
        <p class="text-sm text-gray-600">{{ user.email }}</p>
      </div>
    }
    <button (click)="triggerLogoff()" class="custom-link">Log off</button>
  </div>
  `,
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  get user() {
    return this.authService.currentUser;
  }

  triggerLogoff() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
