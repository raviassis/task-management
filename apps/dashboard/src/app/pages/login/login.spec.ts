/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { LoginPage } from './login';

describe('Login', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('emailError()', () => {
    it('should return null if email field untouched', () => {
      expect(component.emailError()).toBeNull();
    });

    it('should return error string if email field touched and invalid', () => {
      const emailControl = component.loginForm.get('email')!;
      emailControl.setValue('');
      emailControl.markAsTouched();

      const error = component.emailError();
      expect(typeof error).toBe('string');
      expect(error?.length).toBeGreaterThan(0);
    });

    it('should return null if email field touched and valid', () => {
      const emailControl = component.loginForm.get('email')!;
      emailControl.setValue('teste@example.com');
      emailControl.markAsTouched();

      expect(component.emailError()).toBeNull();
    });
  });

  describe('passwordError()', () => {
    it('should return null if password field untouched', () => {
      expect(component.passwordError()).toBeNull();
    });

    it('should return error string if password field touched and invalid', () => {
      const passwordControl = component.loginForm.get('password')!;
      passwordControl.setValue('');
      passwordControl.markAsTouched();

      const error = component.passwordError();
      expect(typeof error).toBe('string');
      expect(error?.length).toBeGreaterThan(0);
    });

    it('should return null if password field touched and valid', () => {
      const passwordControl = component.loginForm.get('password')!;
      passwordControl.setValue('12345678');
      passwordControl.markAsTouched();

      expect(component.passwordError()).toBeNull();
    });
  });

  describe('valid()', () => {
    it('should return false if form invalid', () => {
      component.loginForm.get('email')!.setValue('');
      component.loginForm.get('password')!.setValue('');
      expect(component.valid()).toBeFalsy();
    });

    it('should return false if emailError returns string', () => {
      const emailControl = component.loginForm.get('email')!;
      emailControl.setValue('');
      emailControl.markAsTouched();

      component.loginForm.get('password')!.setValue('123456');
      component.loginForm.get('password')!.markAsTouched();

      expect(component.valid()).toBeFalsy();
    });

    it('should return false if passwordError returns string', () => {
      component.loginForm.get('email')!.setValue('teste@example.com');
      component.loginForm.get('email')!.markAsTouched();

      const passwordControl = component.loginForm.get('password')!;
      passwordControl.setValue('');
      passwordControl.markAsTouched();

      expect(component.valid()).toBeFalsy();
    });

    it('should return true if form valid and no errors', () => {
      component.loginForm.get('email')!.setValue('teste@example.com');
      component.loginForm.get('email')!.markAsTouched();

      component.loginForm.get('password')!.setValue('12345678');
      component.loginForm.get('password')!.markAsTouched();

      expect(component.valid()).toBeTruthy();
    });
  });
});
