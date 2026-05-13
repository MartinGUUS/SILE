import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CambioPendiente } from '../models/cambio-pendiente.model';
@Injectable({ providedIn: 'root' })
export class CambiosService {

  private apiUrl = `/cambios`;

  constructor(private http: HttpClient) {}

  enviarCambio(cambio: CambioPendiente): Observable<CambioPendiente> {
    return this.http.post<CambioPendiente>(`${this.apiUrl}`, cambio);
  }

  listarPendientes(): Observable<CambioPendiente[]> {
    return this.http.get<CambioPendiente[]>(`${this.apiUrl}/pendientes`);
  }

  contarPendientes(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/pendientes/count`);
  }

  listarMisSolicitudes(): Observable<CambioPendiente[]> {
    return this.http.get<CambioPendiente[]>(`${this.apiUrl}/mis-solicitudes`);
  }

  listarProcesados(): Observable<CambioPendiente[]> {
    return this.http.get<CambioPendiente[]>(`${this.apiUrl}/procesados`);
  }

  aprobarCambio(id: number): Observable<CambioPendiente> {
    return this.http.put<CambioPendiente>(`${this.apiUrl}/${id}/aprobar`, {});
  }

  rechazarCambio(id: number, comentario: string): Observable<CambioPendiente> {
    return this.http.put<CambioPendiente>(`${this.apiUrl}/${id}/rechazar`, { comentario });
  }
}
