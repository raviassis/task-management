import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Organization {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  subOrganizations: Omit<Organization, 'subOrganizations'>[]
}

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private readonly baseUrl = `${environment.apiUrl}/organizations`;
  private authService = inject(AuthService);
  private http = inject(HttpClient);


  getOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(this.baseUrl, {
      headers: {
        'Authorization': `Bearer ${this.authService.currentUser?.access_token}`
      }
    });
  }

  getOrganization(id: number): Observable<Organization> {
    return this.http.get<Organization>(`${this.baseUrl}/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.authService.currentUser?.access_token}`
      }
    });
  }
}
