import {
  Component, OnInit, AfterViewChecked, OnDestroy,
  ViewChild, ElementRef, inject,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  Chart, DoughnutController, ArcElement,
  LineController, LineElement, PointElement,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler,
} from 'chart.js';

import { BudgetService } from '../../core/services/budget.service';
import { StatsService }  from '../../core/services/stats.service';
import {
  BudgetStatusItem, BudgetStatusResponse, BudgetStatusLevel, Category,
  CategoryStatsResponse, MonthlyStatsResponse,
} from '../../core/models';

Chart.register(
  DoughnutController, ArcElement,
  LineController, LineElement, PointElement,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler,
);

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
export class DashboardComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('pieCanvas')  pieCanvas!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;

  private budgetService = inject(BudgetService);
  private statsService  = inject(StatsService);

  // Budget status (existing)
  status: BudgetStatusResponse | null = null;
  budgetsLoading = true;

  // Chart data
  categoryStats: CategoryStatsResponse | null = null;
  monthlyStats:  MonthlyStatsResponse  | null = null;
  statsLoaded  = false;
  statsLoading = true;

  private pieChart?:  Chart;
  private lineChart?: Chart;
  private chartsCreated = false;

  ngOnInit(): void {
    this.loadBudgetStatus();
    this.loadStats();
  }

  /** Initialize charts once canvases appear in the DOM */
  ngAfterViewChecked(): void {
    if (this.statsLoaded && !this.chartsCreated && this.pieCanvas && this.lineCanvas) {
      this.chartsCreated = true;
      this.initCharts();
    }
  }

  ngOnDestroy(): void {
    this.pieChart?.destroy();
    this.lineChart?.destroy();
  }

  // ── Data loading ──────────────────────────────────────────────

  private loadBudgetStatus(): void {
    this.budgetService.getStatus().subscribe({
      next: (data) => { this.status = data; this.budgetsLoading = false; },
      error: () =>  { this.budgetsLoading = false; },
    });
  }

  private loadStats(): void {
    forkJoin({
      category: this.statsService.getByCategory(),
      monthly:  this.statsService.getMonthly(),
    }).subscribe({
      next: ({ category, monthly }) => {
        this.categoryStats = category;
        this.monthlyStats  = monthly;
        this.statsLoading  = false;
        this.statsLoaded   = true;
      },
      error: () => { this.statsLoading = false; },
    });
  }

  // ── Chart initialization ──────────────────────────────────────

  private initCharts(): void {
    this.buildPieChart();
    this.buildLineChart();
  }

  private buildPieChart(): void {
    const items = this.categoryStats?.items ?? [];
    this.pieChart = new Chart(this.pieCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: items.map((i) => i.name),
        datasets: [{
          data:            items.map((i) => i.total),
          backgroundColor: items.map((i) => i.color),
          borderColor:     items.map((i) => i.color + 'cc'),
          borderWidth: 2,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 14, padding: 16 } },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed as number;
                return ` $${val.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
              },
            },
          },
        },
        cutout: '60%',
      },
    });
  }

  private buildLineChart(): void {
    const months = this.monthlyStats?.months ?? [];
    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: months.map((m) => m.label),
        datasets: [{
          label: 'Gastos mensuales',
          data:  months.map((m) => m.total),
          borderColor: '#3949ab',
          backgroundColor: 'rgba(57, 73, 171, 0.08)',
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#3949ab',
          fill: true,
          tension: 0.35,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed.y as number;
                return ` $${val.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (v) => `$${Number(v).toLocaleString('es-MX')}`,
            },
          },
        },
      },
    });
  }

  // ── Budget status helpers (unchanged) ────────────────────────

  getProgressValue(item: BudgetStatusItem): number {
    return Math.min(item.percentage, 100);
  }

  getProgressColor(level: BudgetStatusLevel): 'primary' | 'accent' | 'warn' {
    if (level === 'exceeded') return 'warn';
    if (level === 'warning')  return 'accent';
    return 'primary';
  }

  getStatusIcon(level: BudgetStatusLevel): string {
    if (level === 'exceeded') return 'error';
    if (level === 'warning')  return 'warning';
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
      .filter((i) => i.budget.type === 'general')
      .reduce((s, i) => s + i.budget.amount, 0) ?? 0;
  }

  get totalSpent(): number {
    return this.status?.items.find((i) => i.budget.type === 'general')?.spent ?? 0;
  }
}
