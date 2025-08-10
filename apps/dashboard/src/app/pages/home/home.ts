import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { OrganizationService } from '../../services/organization.service';
import { Organization } from '@task-management/data';
import { CreateOrganizationModal } from './create-organization-modal/create-organization-modal';
import { CreateOrganizationDto } from '@task-management/data';
import { LoadingComponent } from '../../components/loading/loading';
import { finalize } from 'rxjs';
import { AlertComponent } from '../../components/alert-message/alert-message';
import { OrganizationPage } from '../organization/organization';
import { HeaderComponent } from '../../components/header/header';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule, RouterLink, CreateOrganizationModal, LoadingComponent,
    AlertComponent, HeaderComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomePage implements OnInit {
  private authService = inject(AuthService);
  private organizationService = inject(OrganizationService);
  private router = inject(Router);
  user = this.authService.currentUser;

  showCreateOrganizationModal = false;
  showCreateSubOrganizationModal = false;
  selectedParentOrg?: Organization | null;
  isLoading = false;
  errorMessage: string | null = null;

  organizations: Organization[] = [];

  ngOnInit() {
    this.organizationService.getOrganizations().subscribe({
      next: (orgs) => {
        this.organizations = orgs;
      },
    });
  }

  expanded = signal<Record<number, boolean>>({});

  toggle(orgSlug: number) {
    const current = this.expanded()[orgSlug] ?? false;
    this.expanded.update((state) => ({ ...state, [orgSlug]: !current }));
    if (!current) {
      const org = this.organizations.find((o) => (o.id === orgSlug))!;
      this.organizationService.getOrganization(org.id).subscribe({
        next: (res) => {
          org.subOrganizations = res.subOrganizations;
        },
      });
    }
  }

  getSubOrganizations(org: Organization) {
    return org.subOrganizations || [];
  }

  createOrganization() {
    this.showCreateOrganizationModal = true;
  }

  handleCreateOrganization(dto: CreateOrganizationDto) {
    this.showCreateOrganizationModal = false;
    this.isLoading = true;
    this.organizationService.createOrganization(dto)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (org) => {
          this.organizations.unshift(org);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Unexpected error';
        },
      });
  }

  createSubOrganization(org: Organization) {
    this.showCreateSubOrganizationModal = true;
    this.selectedParentOrg = org;
  }

  handleCreateSubOrganization(dto: CreateOrganizationDto) {
    this.showCreateSubOrganizationModal = false;
    this.isLoading = true;
    this.organizationService.createOrganization(dto)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (org) => {
          this.organizations
            .find(o => o.id === dto.parentId)
            ?.subOrganizations.unshift(org);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Unexpected error';
        },
      });
  }

  logoff() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}