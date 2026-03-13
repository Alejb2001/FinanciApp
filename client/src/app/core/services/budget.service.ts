import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Budget, CreateBudgetDto, UpdateBudgetDto, BudgetFilters, BudgetStatusResponse } from '../models/budget.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/budgets';

  getAll(filters?: BudgetFilters): Observable<Budget[]> {
    let params = new HttpParams();
    if (filters?.type) params = params.set('type', filters.type);

    return this.http.get<ApiResponse<Budget[]>>(this.base, { params }).pipe(map((r) => r.data));
  }

  getOne(id: string): Observable<Budget> {
    return this.http.get<ApiResponse<Budget>>(`${this.base}/${id}`).pipe(map((r) => r.data));
  }

  create(dto: CreateBudgetDto): Observable<Budget> {
    return this.http.post<ApiResponse<Budget>>(this.base, dto).pipe(map((r) => r.data));
  }

  update(id: string, dto: UpdateBudgetDto): Observable<Budget> {
    return this.http.put<ApiResponse<Budget>>(`${this.base}/${id}`, dto).pipe(map((r) => r.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getStatus(): Observable<BudgetStatusResponse> {
    return this.http
      .get<ApiResponse<BudgetStatusResponse>>(`${this.base}/status`)
      .pipe(map((r) => r.data));
  }
}
