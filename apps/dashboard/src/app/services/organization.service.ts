import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { CreateOrganizationDto, Organization } from '@task-management/data';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private readonly baseUrl = `${environment.apiUrl}/organizations`;
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  headers = {
    'Authorization': `Bearer ${this.authService.currentUser?.access_token}`
  }

  getOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(this.baseUrl, {
      headers: this.headers,
    });
  }

  getOrganization(id: number): Observable<Organization> {
    return this.http.get<Organization>(`${this.baseUrl}/${id}`, {
      headers: this.headers,
    });
  }

  createOrganization(dto: CreateOrganizationDto): Observable<Organization> {
    return this.http.post<Organization>(this.baseUrl, dto, {
      headers: this.headers,
    }).pipe(
      catchError((error) => {
        const status = [HttpStatusCode.BadRequest, HttpStatusCode.Forbidden]
        if (status.includes(error.status)) {
          return throwError(() => new Error(error.error.message));
        }
        return throwError(() => error);
      })
    );
  }
}
