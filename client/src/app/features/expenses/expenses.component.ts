import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { ExpenseService } from '../../core/services/expense.service';
import { Expense, Category } from '../../core/models';
import { ExpenseFormComponent } from './expense-form/expense-form.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss',
})
export class ExpensesComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  expenses: Expense[] = [];
  loading = false;
  displayedColumns = ['date', 'category', 'description', 'amount', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.expenseService.getAll().subscribe({
      next: (data) => { this.expenses = data; this.loading = false; },
      error: () => { this.loading = false; this.notify('Error al cargar gastos'); },
    });
  }

  openForm(expense?: Expense): void {
    const ref = this.dialog.open(ExpenseFormComponent, {
      width: '500px',
      disableClose: true,
      data: expense ?? null,
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.load();
        this.notify(expense ? 'Gasto actualizado' : 'Gasto registrado');
      }
    });
  }

  delete(expense: Expense): void {
    if (!confirm(`¿Eliminar "${expense.description}"?`)) return;
    this.expenseService.delete(expense._id).subscribe({
      next: () => { this.load(); this.notify('Gasto eliminado'); },
      error: () => this.notify('Error al eliminar'),
    });
  }

  getCategoryName(category: Category | string): string {
    return typeof category === 'string' ? '' : category.name;
  }

  getCategoryColor(category: Category | string): string {
    return typeof category === 'string' ? '#ccc' : category.color;
  }

  private notify(msg: string): void {
    this.snackBar.open(msg, 'OK', { duration: 3000 });
  }
}
