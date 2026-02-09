import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FileService {
  private api = '/api/files';

  constructor(private http: HttpClient) {}

  upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(this.api, formData, { responseType: 'text' });
  }
}
