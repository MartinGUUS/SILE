import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private http = inject(HttpClient);
  // Usa proxy local
  private apiUrl = `/usuarios`;

  // Obtener lista completa
  getAllUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Cambiar estado ("1" activo, "2" inactivo)
  cambiarEstado(id: number, nuevoEstado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/estado`, { estado: nuevoEstado });
  }

  // Cambiar rol (1 Admin, 3 Usuario Común...)
  cambiarRol(id: number, nuevoRol: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/estado`, { fkRol: nuevoRol.toString() });
  }

  // Actualizar propiedades
  actualizar(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
