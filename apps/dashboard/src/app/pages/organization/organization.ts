import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { UserService } from '../../services/users.service';
import { Organization, UserProfile } from '@task-management/data';
import { OrganizationService, UserInvite } from '../../services/organization.service';
import { InviteMemberModal } from './invite-member-modal/invite-member-modal';

@Component({
  selector: 'app-organization',
  imports: [CommonModule, RouterModule, HeaderComponent, InviteMemberModal],
  templateUrl: './organization.html',
  styleUrl: './organization.css',
})
export class OrganizationPage implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private organizationService = inject(OrganizationService);

  showInviteModal = false;
  organizationId = signal<number>(1); // default fallback
  tasks = signal<any[]>([]);
  loading = signal<boolean>(true);

  organization: Organization | undefined;

  users: UserProfile[] = [];

  ngOnInit() {
    this.route.params.subscribe(params => {
      const organizationId = +params['organizationId'];
      this.organizationId.set(organizationId);
      this.fetchOrganization(organizationId);
    });
  }
  fetchOrganization(organizationId: number) {
    this.organizationService.getOrganization(organizationId).subscribe({
      next: (res) => {
        this.organization = res;
        this.fetchUsers();
      }
    });
  }

  fetchUsers() {
    this.userService.getUsers().subscribe({
      next: (res) => {
        this.users = res.filter( u => {
          return !this.organization?.members.some( m => m.userId === u.id);
        });
      }
    });
  }

  fetchTasks(id: number) {
    // this.loading.set(true);
    // this.http.get<any[]>(`/organizations/${id}/tasks`).subscribe({
    //   next: data => {
    //     this.tasks.set(data);
    //     this.loading.set(false);
    //   },
    //   error: err => {
    //     console.error('Failed to load tasks', err);
    //     this.loading.set(false);
    //   },
    // });
  }

  inviteMember() {
    this.showInviteModal = true;
  }

  handleInviteMember(dto: UserInvite) {
    this.showInviteModal = false;
    if (this.organization?.id) {
      this.organizationService.inviteMember(this.organizationId(), dto)
        .subscribe({
          next: () => {
            this.fetchOrganization(this.organizationId())
          },
          error: (err) => {
            console.log(err);
          }
        });
    }
  }
}
