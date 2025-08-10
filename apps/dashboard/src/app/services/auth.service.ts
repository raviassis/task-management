import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { LoginDto, UserProfile } from '@task-management/data';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  public readonly user$: Observable<UserProfile | null> = this.userSubject.asObservable();

  loadUserProfile(): Observable<UserProfile> {
    // TODO: Set up HTTPS on both backend and frontend to allow secure cookie-based authentication 
    // in production.
    // ref: https://medium.com/kanlanc/heres-why-storing-jwt-in-local-storage-is-a-great-mistake-df01dad90f9e
    return this.http.get<UserProfile>(`${this.baseUrl}/profile`, { withCredentials: true }).pipe(
      tap((user) => this.userSubject.next(user)),
      catchError((error) => {
        if (error.status === 401) {
          return throwError(() => new Error('User logged out'));
        }
        return throwError(() => error);
      })
    );
  }

  login(dto: LoginDto): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.baseUrl}/login`, dto).pipe(
      tap((user) => this.userSubject.next(user)),
      catchError((error) => {
        if (error.status === 401) {
          return throwError(() => new Error('Invalid email or password'));
        }
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.userSubject.next(null);
  }

  get currentUser(): UserProfile | null {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }
}
