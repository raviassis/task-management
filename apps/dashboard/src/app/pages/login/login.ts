import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginDto } from '@task-management/data';
import { validateSync } from 'class-validator';
import { AuthService } from '../../services/auth.service';
import { AlertComponent } from '../../components/alert-message/alert-message';
import { Router, RouterLink } from '@angular/router';
import { LoadingComponent } from '../../components/loading/loading';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    AlertComponent,
    LoadingComponent,
    RouterLink,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginPage {
  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  loginForm: FormGroup = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  errorMessage: string | null = null;

  isLoading = false;

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
    this.isLoading = true;
    this.errorMessage = null;
    const dto = new LoginDto();
    dto.email = this.loginForm.get('email')?.value;
    dto.password = this.loginForm.get('password')?.value;
    this.authService.login(dto).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage = err.message || 'Unexpected error';
      },
    });
  }
}
