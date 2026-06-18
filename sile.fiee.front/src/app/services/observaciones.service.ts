import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Observacion } from '../models/observacion.model';

@Injectable({
  providedIn: 'root'
})
export class ObservacionesService {
  private http = inject(HttpClient);

  getAllByActivo(id: string): Observable<Observacion[]> {
    return this.http.get<Observacion[]>(`/observaciones/activo/${id}`);
  }

  create(data: any): Observable<Observacion> {
    return this.http.post<Observacion>('/observaciones', data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`/observaciones/${id}`);
  }
}
