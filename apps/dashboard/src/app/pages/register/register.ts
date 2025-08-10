import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AlertComponent } from '../../components/alert-message/alert-message';
import { LoadingComponent } from '../../components/loading/loading';
import { CreateUserDto } from '@task-management/data';
import { validateSync } from 'class-validator';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AlertComponent,
    LoadingComponent,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterPage {
  private fb = inject(FormBuilder);

  registerForm: FormGroup = this.fb.group({
    email: [''],
    name: [''],
    password: [''],
    confirmPassword: [''],
  });

  errorMessage: string | null = null;

  isLoading = false;

  validateField(fieldName: keyof CreateUserDto): string | null {
      const field = this.registerForm.get(fieldName);
      if (!field?.touched) return null;
      const dto = new CreateUserDto();
      dto[fieldName] = field.value;
      const errors = validateSync(dto);
      const error = errors.find(e => e.property === fieldName);
      if (!error || !error.constraints) return null;
      return Object.values(error.constraints)[0];
    }

  emailError() {
    return this.validateField('email');
  }

  nameError() {
    return this.validateField('name');
  }

  passwordError() {
    return this.validateField('password');
  }

  confirmPasswordError() {
    const password = this.registerForm.get('password');
    const confirmPassword = this.registerForm.get('confirmPassword');
    if (confirmPassword?.touched && password?.value !== confirmPassword.value) 
      return 'Password do not match';
    return null;
  }

  valid() {
    return this.registerForm.valid 
      && !this.emailError()
      && !this.nameError()
      && !this.passwordError()
      && !this.confirmPasswordError();
  }
}
