import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginDto } from '@task-management/data';
import { validateSync } from 'class-validator';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginPage {
  private fb = inject(FormBuilder);
  loginForm: FormGroup = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  validateField(fieldName: keyof LoginDto): string | null {
    const field = this.loginForm.get(fieldName);
    if (!field?.touched) return null;
    const dto = new LoginDto();
    dto[fieldName] = field.value;
    const errors = validateSync(dto);
    const error = errors.find(e => e.property === fieldName);
    if (!error || !error.constraints) return null;
    return Object.values(error.constraints)[0];
  }

  emailError(): string | null {
    return this.validateField('email');
  }

  passwordError(): string | null {
    return this.validateField('password');
  }

  valid() {
    return this.loginForm.valid 
      && !this.emailError() 
      && !this.passwordError();
  }
    
  async submit() {
    const dto = new LoginDto();
    dto.email = this.loginForm.get('email')?.value;
    dto.password = this.loginForm.get('password')?.value;
    console.log('call api');
  }
}
