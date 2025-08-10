import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Task } from '@task-management/data';

export interface TaskCreateRequest {
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly baseUrl = `${environment.apiUrl}/organizations`;
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  get headers() {
    return {
      'Authorization': `Bearer ${this.authService.currentUser?.access_token}`
    }
  }

  getTasks(organizationId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/${organizationId}/tasks`, {
      headers: this.headers,
    }).pipe(
      catchError((error) => {
        const status = [HttpStatusCode.BadRequest, HttpStatusCode.Forbidden]
        if (status.includes(error.status)) {
          return throwError(() => new Error(error.error.message));
        }
        return throwError(() => error);
      }),
    );
  }

  createTask(organizationId: number, dto: TaskCreateRequest) {
    return this.http.post<Task>(`${this.baseUrl}/${organizationId}/tasks`, dto, {
      headers: this.headers,
    }).pipe(
      catchError((error) => {
        const status = [HttpStatusCode.BadRequest, HttpStatusCode.Forbidden]
        if (status.includes(error.status)) {
          return throwError(() => new Error(error.error.message));
        }
        return throwError(() => error);
      }),
    );
  }
}
