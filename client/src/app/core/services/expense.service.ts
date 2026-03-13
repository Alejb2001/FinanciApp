import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Expense, CreateExpenseDto, UpdateExpenseDto, ExpenseFilters } from '../models/expense.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/expenses';

  getAll(filters?: ExpenseFilters): Observable<Expense[]> {
    let params = new HttpParams();
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);

    return this.http.get<ApiResponse<Expense[]>>(this.base, { params }).pipe(map((r) => r.data));
  }

  getOne(id: string): Observable<Expense> {
    return this.http.get<ApiResponse<Expense>>(`${this.base}/${id}`).pipe(map((r) => r.data));
  }

  create(dto: CreateExpenseDto): Observable<Expense> {
    return this.http.post<ApiResponse<Expense>>(this.base, dto).pipe(map((r) => r.data));
  }

  update(id: string, dto: UpdateExpenseDto): Observable<Expense> {
    return this.http.put<ApiResponse<Expense>>(`${this.base}/${id}`, dto).pipe(map((r) => r.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
