import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { OrganizationService } from '../../services/organization.service';
import { Organization } from '@task-management/data';
import { CreateOrganizationModal } from './create-organization-modal/create-organization-modal';
import { CreateOrganizationDto } from '@task-management/data';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, CreateOrganizationModal],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomePage implements OnInit {
  private authService = inject(AuthService);
  private organizationService = inject(OrganizationService);
  private router = inject(Router);
  user = {
    name: 'Ravi',
    email: 'ravi@example.com',
  };

  showCreateOrganizationModal = false;

  organizations: Organization[] = [];

  ngOnInit() {
    this.organizationService.getOrganizations().subscribe({
      next: (orgs) => {
        this.organizations = orgs;
      },
    });
  }

  expanded = signal<Record<string, boolean>>({});

  toggle(orgSlug: number) {
    const current = this.expanded()[orgSlug] ?? false;
    this.expanded.update((state) => ({ ...state, [orgSlug]: !current }));
  }

  getSubOrganizations(org: Organization) {
    if (org.subOrganizations && org.subOrganizations.length > 0) {
      return org.subOrganizations;
    }
    org = this.organizations.find((o) => (o.id = org.id))!;
    this.organizationService.getOrganization(org.id).subscribe({
      next: (res) => {
        org.subOrganizations = res.subOrganizations;
      },
    });
    return [];
  }

  createOrganization() {
    this.showCreateOrganizationModal = true;
  }

  handleCreateOrganization(dto: CreateOrganizationDto) {
    console.log('New organization:', dto);
    this.showCreateOrganizationModal = false;
  }

  createSubOrganization(orgName: string) {
    console.log(`Create sub-organization under ${orgName}`);
  }

  logoff() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
