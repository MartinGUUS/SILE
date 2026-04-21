import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Inyectamos el cliente HTTP para hacer peticiones al backend
  private http = inject(HttpClient);

  // Ahora la conexión usa el Proxy local de Angular, así funciona con HTTPS sin problemas de Mixed Content.
  private apiUrl = `/auth`;


  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }


  saveSession(response: any): void {
    localStorage.setItem('token', response.token);
    if(response.fkRol) localStorage.setItem('fkRol', response.fkRol.toString());
    if(response.idUsuario) localStorage.setItem('idUsuario', response.idUsuario.toString());
  }


  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getFkRol(): number | null {
    const rol = localStorage.getItem('fkRol');
    return rol ? parseInt(rol, 10) : null;
  }

  getIdUsuario(): number | null {
    const id = localStorage.getItem('idUsuario');
    return id ? parseInt(id, 10) : null;
  }


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('fkRol');
    localStorage.removeItem('idUsuario');
  }


  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}