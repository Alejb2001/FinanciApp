import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CategoryStatsResponse, MonthlyStatsResponse } from '../models/stats.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/stats';

  getByCategory(year?: number, month?: number): Observable<CategoryStatsResponse> {
    let params = new HttpParams();
    if (year)  params = params.set('year',  year);
    if (month) params = params.set('month', month);
    return this.http
      .get<ApiResponse<CategoryStatsResponse>>(`${this.base}/by-category`, { params })
      .pipe(map((r) => r.data));
  }

  getMonthly(year?: number): Observable<MonthlyStatsResponse> {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    return this.http
      .get<ApiResponse<MonthlyStatsResponse>>(`${this.base}/monthly`, { params })
      .pipe(map((r) => r.data));
  }
}
