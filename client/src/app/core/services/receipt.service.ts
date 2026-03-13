import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ExtractedReceiptData } from '../models/receipt.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ReceiptService {
  private readonly http = inject(HttpClient);

  uploadPdf(file: File): Observable<ExtractedReceiptData> {
    const form = new FormData();
    form.append('pdf', file);
    return this.http
      .post<ApiResponse<ExtractedReceiptData>>('/api/receipts/upload', form)
      .pipe(map((r) => r.data));
  }
}
