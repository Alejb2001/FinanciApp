import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { BudgetService } from '../../core/services/budget.service';
import { BudgetStatusItem, BudgetStatusResponse, BudgetStatusLevel, Category } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private budgetService = inject(BudgetService);

  status: BudgetStatusResponse | null = null;
  loading = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.budgetService.getStatus().subscribe({
      next: (data) => { this.status = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  getProgressValue(item: BudgetStatusItem): number {
    return Math.min(item.percentage, 100);
  }

  getProgressColor(level: BudgetStatusLevel): 'primary' | 'accent' | 'warn' {
    if (level === 'exceeded') return 'warn';
    if (level === 'warning') return 'accent';
    return 'primary';
  }

  getStatusIcon(level: BudgetStatusLevel): string {
    if (level === 'exceeded') return 'error';
    if (level === 'warning') return 'warning';
    return 'check_circle';
  }

  getCategoryName(item: BudgetStatusItem): string {
    if (item.budget.type === 'general') return 'Presupuesto General';
    const cat = item.budget.category;
    return typeof cat === 'object' && cat !== null ? (cat as Category).name : 'Sin categoría';
  }

  getCategoryColor(item: BudgetStatusItem): string {
    if (item.budget.type === 'general') return '#3949ab';
    const cat = item.budget.category;
    return typeof cat === 'object' && cat !== null ? (cat as Category).color : '#ccc';
  }

  getCategoryIcon(item: BudgetStatusItem): string {
    if (item.budget.type === 'general') return 'account_balance_wallet';
    const cat = item.budget.category;
    return typeof cat === 'object' && cat !== null ? ((cat as Category).icon ?? 'label') : 'label';
  }

  get totalBudget(): number {
    return this.status?.items
      .filter(i => i.budget.type === 'general')
      .reduce((s, i) => s + i.budget.amount, 0) ?? 0;
  }

  get totalSpent(): number {
    const general = this.status?.items.find(i => i.budget.type === 'general');
    return general?.spent ?? 0;
  }
}
