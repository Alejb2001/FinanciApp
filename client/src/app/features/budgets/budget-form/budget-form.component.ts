import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { BudgetService } from '../../../core/services/budget.service';
import { CategoryService } from '../../../core/services/category.service';
import { Budget, Category } from '../../../core/models';

@Component({
  selector: 'app-budget-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './budget-form.component.html',
  styleUrl: './budget-form.component.scss',
})
export class BudgetFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private budgetService = inject(BudgetService);
  private categoryService = inject(CategoryService);
  private dialogRef = inject(MatDialogRef<BudgetFormComponent>);
  readonly budget: Budget | null = inject(MAT_DIALOG_DATA);

  categories: Category[] = [];
  saving = false;
  isEdit = !!this.budget?._id;

  form = this.fb.group({
    type: [this.budget?.type ?? 'monthly', Validators.required],
    amount: [this.budget?.amount ?? null, [Validators.required, Validators.min(0.01)]],
    period: [this.budget?.period ?? 'monthly', Validators.required],
    category: [
      typeof this.budget?.category === 'object'
        ? (this.budget?.category as Category)._id
        : (this.budget?.category ?? ''),
    ],
    startDate: [
      this.budget?.startDate
        ? this.budget.startDate.split('T')[0]
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      Validators.required,
    ],
  });

  get isCategoryType(): boolean {
    return this.form.get('type')?.value === 'category';
  }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((cats) => (this.categories = cats));
  }

  submit(): void {
    if (this.form.invalid) return;
    if (this.isCategoryType && !this.form.get('category')?.value) {
      this.form.get('category')?.setErrors({ required: true });
      return;
    }

    this.saving = true;
    const v = this.form.getRawValue();
    const dto = {
      type: v.type as 'general' | 'category',
      amount: v.amount as number,
      period: v.period as 'weekly' | 'monthly' | 'yearly',
      startDate: new Date(v.startDate as string).toISOString(),
      ...(this.isCategoryType && v.category ? { category: v.category } : {}),
    };

    const op = this.isEdit
      ? this.budgetService.update(this.budget!._id, dto)
      : this.budgetService.create(dto);

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
