import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { UserService } from '../../services/users.service';
import { Organization, Task, UserProfile } from '@task-management/data';
import { OrganizationService, UserInvite } from '../../services/organization.service';
import { InviteMemberModal } from './invite-member-modal/invite-member-modal';
import { AlertComponent } from '../../components/alert-message/alert-message';
import { TaskService } from '../../services/task.service';
import { CreateTaskModal } from './create-task-modal/create-task-modal';

@Component({
  selector: 'app-organization',
  imports: [CommonModule, RouterModule, HeaderComponent, InviteMemberModal, AlertComponent, CreateTaskModal],
  templateUrl: './organization.html',
  styleUrl: './organization.css',
})
export class OrganizationPage implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private organizationService = inject(OrganizationService);
  private taskServices = inject(TaskService);

  showInviteModal = false;
  showCreateTaskModal = false;
  organizationId = signal<number>(1); // default fallback
  tasks: Task[] = [];
  loading = signal<boolean>(false);
  inviteErrorMessage: string | null = null;
  taskErrorMessage: string | null = null;

  organization: Organization | undefined;

  users: UserProfile[] = [];

  ngOnInit() {
    this.route.params.subscribe(params => {
      const organizationId = +params['organizationId'];
      this.organizationId.set(organizationId);
      this.fetchOrganization(organizationId);
      this.fetchTasks(organizationId);
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

  fetchTasks(organizationId: number) {
    this.taskServices.getTasks(organizationId)
      .subscribe({
        next: (res) => {
          this.tasks = res;
        }
      });
  }

  inviteMember() {
    this.showInviteModal = true;
  }

  handleInviteMember(dto: UserInvite) {
    this.showInviteModal = false;
    this.inviteErrorMessage = null;
    if (this.organization?.id) {
      this.organizationService.inviteMember(this.organizationId(), dto)
        .subscribe({
          next: () => {
            this.fetchOrganization(this.organizationId())
          },
          error: (err) => {
            this.inviteErrorMessage = err.message || 'Unexpected error';
          }
        });
    }
  }

  handleCreateTask(dto: any) {
    this.showCreateTaskModal = false;
    this.taskServices.createTask(this.organizationId(), dto)
      .subscribe({
        next: (res) => {
          this.tasks.push(res);
        },
        error: (err) => {
          this.taskErrorMessage = err.message || 'Unexpected error';
        }
      });
  }
}
