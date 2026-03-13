import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
})
export class CategoryFormComponent {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private dialogRef = inject(MatDialogRef<CategoryFormComponent>);
  readonly category: Category | null = inject(MAT_DIALOG_DATA);

  saving = false;
  isEdit = !!this.category?._id;

  form = this.fb.group({
    name: [this.category?.name ?? '', Validators.required],
    color: [this.category?.color ?? '#3949ab', Validators.required],
    icon: [this.category?.icon ?? ''],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const dto = this.form.getRawValue() as { name: string; color: string; icon: string };

    const op = this.isEdit
      ? this.categoryService.update(this.category!._id, dto)
      : this.categoryService.create(dto);

    op.subscribe({
      next: () => { this.saving = false; this.dialogRef.close(true); },
      error: () => { this.saving = false; },
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  get previewColor(): string {
    return this.form.get('color')?.value ?? '#3949ab';
  }

  getErrorMessage(field: string): string {
    return this.form.get(field)?.hasError('required') ? 'Este campo es obligatorio' : '';
  }
}
