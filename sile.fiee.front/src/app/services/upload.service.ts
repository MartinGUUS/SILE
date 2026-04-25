import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private http = inject(HttpClient);
  private apiUrl = '/fotos/upload';

  uploadFoto(file: File): Observable<{ filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ filename: string }>(this.apiUrl, formData);
  }
}
