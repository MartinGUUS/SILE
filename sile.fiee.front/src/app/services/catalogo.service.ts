import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  private http = inject(HttpClient);

  getAll(endpoint: string): Observable<any[]> {
    return this.http.get<any[]>(`/${endpoint}`);
  }

  create(endpoint: string, data: any): Observable<any> {
    return this.http.post(`/${endpoint}`, data);
  }

  update(endpoint: string, id: string, data: any): Observable<any> {
    return this.http.put(`/${endpoint}/${id}`, data);
  }

  cambiarEstado(endpoint: string, id: string, nuevoEstado: string): Observable<any> {
    return this.http.patch(`/${endpoint}/${id}/estado`, { estado: nuevoEstado });
  }
}
