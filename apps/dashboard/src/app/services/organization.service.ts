import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    });
  }
}
