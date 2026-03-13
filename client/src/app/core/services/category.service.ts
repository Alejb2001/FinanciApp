import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/category.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/categories';

  getAll(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(this.base).pipe(map((r) => r.data));
  }

  getOne(id: string): Observable<Category> {
    return this.http.get<ApiResponse<Category>>(`${this.base}/${id}`).pipe(map((r) => r.data));
  }

  create(dto: CreateCategoryDto): Observable<Category> {
    return this.http.post<ApiResponse<Category>>(this.base, dto).pipe(map((r) => r.data));
  }

  update(id: string, dto: UpdateCategoryDto): Observable<Category> {
    return this.http.put<ApiResponse<Category>>(`${this.base}/${id}`, dto).pipe(map((r) => r.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
