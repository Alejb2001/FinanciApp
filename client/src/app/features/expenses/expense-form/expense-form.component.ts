import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ExpenseService } from '../../../core/services/expense.service';
import { CategoryService } from '../../../core/services/category.service';
import { Expense, Category } from '../../../core/models';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.scss',
})
export class ExpenseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private expenseService = inject(ExpenseService);
  private categoryService = inject(CategoryService);
  private dialogRef = inject(MatDialogRef<ExpenseFormComponent>);
  readonly expense: Expense | null = inject(MAT_DIALOG_DATA);

  categories: Category[] = [];
  saving = false;
  isEdit = !!this.expense?._id;

  form = this.fb.group({
    amount: [
      this.expense?.amount ?? null,
      [Validators.required, Validators.min(0.01)],
    ],
    description: [this.expense?.description ?? '', Validators.required],
    date: [
      this.expense?.date ? new Date(this.expense.date) : new Date(),
      Validators.required,
    ],
    category: [
      typeof this.expense?.category === 'object'
        ? (this.expense?.category as Category)._id
        : (this.expense?.category ?? ''),
      Validators.required,
    ],
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((cats) => (this.categories = cats));
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.getRawValue();
    const dto = {
      amount: v.amount as number,
      description: v.description as string,
      date: (v.date as Date).toISOString(),
      category: v.category as string,
    };

    const op = this.isEdit
      ? this.expenseService.update(this.expense!._id, dto)
      : this.expenseService.create(dto);

    op.subscribe({
      next: () => { this.saving = false; this.dialogRef.close(true); },
      error: () => { this.saving = false; },
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage(field: string): string {
    const ctrl = this.form.get(field);
    if (ctrl?.hasError('required')) return 'Este campo es obligatorio';
    if (ctrl?.hasError('min')) return 'El monto debe ser mayor a 0';
    return '';
  }
}
