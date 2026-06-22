import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UploadService } from './upload.service';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  private http = inject(HttpClient);
  private uploadService = inject(UploadService);

  getAll(endpoint: string, estado?: string): Observable<any[]> {
    const url = estado ? `/${endpoint}?estado=${estado}` : `/${endpoint}`;
    return this.http.get<any[]>(url);
  }

  getById(endpoint: string, id: string | number): Observable<any> {
    return this.http.get(`/${endpoint}/${id}`);
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

  delete(endpoint: string, id: string): Observable<any> {
    return this.http.delete(`/${endpoint}/${id}`);
  }

  uploadFile(file: File): Observable<any> {
    return this.uploadService.uploadFoto(file);
  }

  exportarActivos(): Observable<any> {
    return this.http.get('/activos/exportar', { responseType: 'blob' } as any);
  }
}
