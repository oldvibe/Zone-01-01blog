import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface ReportPayload {
  reason: string;
  targetType: string;
  targetId: number;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private api = '/api/reports';

  constructor(private http: HttpClient) {}

  create(payload: ReportPayload) {
    return this.http.post(this.api, payload);
  }
}
