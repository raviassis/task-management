import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { CreateUserDto, LoginDto, User } from '@task-management/data';
import { environment } from '../../environments/environment';

const STORAGEKEY_LOGGED_USER = 'logged-user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  loadUserProfile(): Observable<User | null> {
    // TODO: Set up HTTPS on both backend and frontend to allow secure cookie-based authentication 
    // in production.
    // ref: https://medium.com/kanlanc/heres-why-storing-jwt-in-local-storage-is-a-great-mistake-df01dad90f9e
    // uncomment code above when resolve it
    // return this.http.get<UserProfile>(`${this.baseUrl}/profile`, { withCredentials: true }).pipe(
    //   tap((user) => this.userSubject.next(user)),
    //   catchError((error) => {
    //     if (error.status === 401) {
    //       return throwError(() => new Error('User logged out'));
    //     }
    //     return throwError(() => error);
    //   })
    // );
    return of(this.currentUser);
  }

  login(dto: LoginDto): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/login`, dto).pipe(
      tap((user) => {
        // TODO: don't save token in localstorage.
        // Remove it after solve cookie-based authentication
        localStorage.setItem(STORAGEKEY_LOGGED_USER, JSON.stringify(user));
      }),
      catchError((error) => {
        if (error.status === HttpStatusCode.Unauthorized) {
          return throwError(() => new Error('Invalid email or password'));
        }
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGEKEY_LOGGED_USER);
  }

  get currentUser(): User | null {
    const userJson = localStorage.getItem(STORAGEKEY_LOGGED_USER);
    if (userJson) {
      return JSON.parse(userJson) as User;
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  registerUser(dto: CreateUserDto) {
    return this.http.post(`${this.baseUrl}/register`, dto).pipe(
      catchError((err) => {
        if (err.status === HttpStatusCode.Conflict) {
          return throwError(() => new Error(err.error.message));
        }
        return throwError(() => err);
      })
    );
  }
}
