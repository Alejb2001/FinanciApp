import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { BudgetService } from '../../core/services/budget.service';
import { Budget, Category } from '../../core/models';
import { BudgetFormComponent } from './budget-form/budget-form.component';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatDialogModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.scss',
})
export class BudgetsComponent implements OnInit {
  private budgetService = inject(BudgetService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  budgets: Budget[] = [];
  loading = false;
  displayedColumns = ['type', 'category', 'amount', 'period', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.budgetService.getAll().subscribe({
      next: (data) => { this.budgets = data; this.loading = false; },
      error: () => { this.loading = false; this.notify('Error al cargar presupuestos'); },
    });
  }

  openForm(budget?: Budget): void {
    const ref = this.dialog.open(BudgetFormComponent, {
      width: '500px',
      disableClose: true,
      data: budget ?? null,
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.load();
        this.notify(budget ? 'Presupuesto actualizado' : 'Presupuesto creado');
      }
    });
  }

  delete(budget: Budget): void {
    const name = budget.type === 'general' ? 'General' : this.getCategoryName(budget.category);
    if (!confirm(`¿Eliminar el presupuesto "${name}"?`)) return;
    this.budgetService.delete(budget._id).subscribe({
      next: () => { this.load(); this.notify('Presupuesto eliminado'); },
      error: () => this.notify('Error al eliminar'),
    });
  }

  getCategoryName(category: Budget['category']): string {
    if (!category) return '—';
    return typeof category === 'object' ? (category as Category).name : '';
  }

  getCategoryColor(category: Budget['category']): string {
    if (!category) return '#ccc';
    return typeof category === 'object' ? (category as Category).color : '#ccc';
  }

  private notify(msg: string): void {
    this.snackBar.open(msg, 'OK', { duration: 3000 });
  }
}
