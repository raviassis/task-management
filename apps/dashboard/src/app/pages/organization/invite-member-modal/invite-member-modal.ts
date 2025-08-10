import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Modal } from '../../../components/modal/modal';
import { UserInvite } from '../../../services/organization.service';

@Component({
  selector: 'app-invite-member-modal',
  imports: [CommonModule, ReactiveFormsModule, Modal],
  templateUrl: './invite-member-modal.html',
  styleUrl: './invite-member-modal.css',
})
export class InviteMemberModal {
  @Input() users: { id: number; name: string; email: string }[] = [];
  @Output() ngClose = new EventEmitter<void>();
  @Output() invite = new EventEmitter<UserInvite>();
  fb = inject(FormBuilder)
  form = this.fb.group({
    userId: [0],
    role: ['viewer'],
  });

  submit() {
    if (this.form.valid) {
      const invite: UserInvite = {
        userId: this.form.get('userId')!.value as number,
        role: this.form.get('role')!.value as string,
      }
      this.invite.emit(invite);
      this.form.reset({ role: 'viewer' });
    } else {
      this.form.markAllAsTouched();
    }
  }

  cancel() {
    this.ngClose.emit();
  }
}
