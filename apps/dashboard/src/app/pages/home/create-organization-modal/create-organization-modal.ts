import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CreateOrganizationDto, Organization } from '@task-management/data';
import { validateSync } from 'class-validator';
import { Modal } from '../../../components/modal/modal';

@Component({
  selector: 'app-create-organization-modal',
  imports: [CommonModule, ReactiveFormsModule, Modal],
  templateUrl: './create-organization-modal.html',
  styleUrl: './create-organization-modal.css',
})
export class CreateOrganizationModal {
  @Input() parent?: Organization | null;
  @Output() ngClose = new EventEmitter<void>();
  @Output() create = new EventEmitter<CreateOrganizationDto>();

  private fb = inject(FormBuilder);

  form = this.fb.group({
    name: [''],
  });

  nameError(): string | null {
    const field = this.form.get('name');
    if (!field?.touched) return null;
    const dto = new CreateOrganizationDto();
    dto.name = field.value as string;
    const errors = validateSync(dto);
    const error = errors.find(e => e.property === 'name');
    if (!error || !error.constraints) return null;
    return Object.values(error.constraints)[0];
  }

  submit() {
    if (this.form.valid && this.form.value.name) {
      const dto = new CreateOrganizationDto();
      dto.name = this.form.value.name as string;
      dto.parentId = this.parent?.id;
      this.create.emit(dto);
      this.form.reset();
    } else {
      this.form.markAllAsTouched();
    }
  }

  cancel() {
    this.ngClose.emit();
  }
}
