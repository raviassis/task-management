import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomePage {
  private authService = inject(AuthService);
  private router = inject(Router);
  user = {
    name: 'Ravi',
    email: 'ravi@example.com',
  };

  organizations = [
    {
      name: 'Acme Corp',
      slug: 'acme-corp',
      subOrganizations: [
        { name: 'Marketing', slug: 'marketing' },
        { name: 'Engineering', slug: 'engineering' },
      ],
    },
    {
      name: 'Beta Group',
      slug: 'beta-group',
      subOrganizations: [
        { name: 'Design', slug: 'design' },
        { name: 'Support', slug: 'support' },
      ],
    },
  ];


  expanded = signal<Record<string, boolean>>({});

  toggle(orgSlug: string) {
    const current = this.expanded()[orgSlug] ?? false;
    this.expanded.update(state => ({ ...state, [orgSlug]: !current }));
  }

  createOrganization() {
    console.log('Create new organization');
  }

  createSubOrganization(orgName: string) {
    console.log(`Create sub-organization under ${orgName}`);
  }

  logoff() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
