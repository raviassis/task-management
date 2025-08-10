import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from '../../../components/modal/modal';
import { TaskCreateRequest } from '../../../services/task.service';

@Component({
  selector: 'app-create-task-modal',
  imports: [CommonModule, ReactiveFormsModule, Modal],
  templateUrl: './create-task-modal.html',
  styleUrl: './create-task-modal.css',
})
export class CreateTaskModal {
  @Output() ngClose = new EventEmitter<void>();
  @Output() create = new EventEmitter<TaskCreateRequest>();

  fb = inject(FormBuilder);
  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
  });

  submit() {
    if (this.form.valid) {
      const task: TaskCreateRequest = {
        title: this.form.get('title')!.value as string,
        description: this.form.get('description')!.value as string,
      };
      this.create.emit(task);
      this.form.reset();
    } else {
      this.form.markAllAsTouched();
    }
  }

  cancel() {
    this.ngClose.emit();
  }
}
