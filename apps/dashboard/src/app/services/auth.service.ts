import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { LoginDto, User } from '@task-management/data';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private userSubject = new BehaviorSubject<User | null>(null);
  public readonly user$: Observable<User | null> = this.userSubject.asObservable();

  login(dto: LoginDto): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/login`, dto).pipe(
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

  get currentUser(): User | null {
    return this.userSubject.value;
  }
}
