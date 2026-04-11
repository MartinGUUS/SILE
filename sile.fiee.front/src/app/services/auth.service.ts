import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Inyectamos el cliente HTTP para hacer peticiones al backend
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/auth';


  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }


  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }


  getToken(): string | null {
    return localStorage.getItem('token');
  }


  logout(): void {
    localStorage.removeItem('token');
  }


  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}