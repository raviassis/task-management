import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";
import { Observable } from "rxjs";
import { UserProfile } from "@task-management/data";


@Injectable({
  providedIn: 'root',
})
export class UserService {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;
  headers = {
    'Authorization': `Bearer ${this.authService.currentUser?.access_token}`
  }

  getUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(this.baseUrl, {
      headers: this.headers,
    });
  }
}
