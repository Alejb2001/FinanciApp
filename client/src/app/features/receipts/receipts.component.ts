import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ReceiptService } from '../../core/services/receipt.service';
import { ExpenseService } from '../../core/services/expense.service';
import { CategoryService } from '../../core/services/category.service';
import { ExtractedReceiptData, Category } from '../../core/models';

type PageState = 'upload' | 'uploading' | 'review' | 'saving' | 'done';

@Component({
  selector: 'app-receipts',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './receipts.component.html',
  styleUrl: './receipts.component.scss',
})
export class ReceiptsComponent implements OnInit {
  private receiptService = inject(ReceiptService);
  private expenseService = inject(ExpenseService);
  private categoryService = inject(CategoryService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  state: PageState = 'upload';
  extracted: ExtractedReceiptData | null = null;
  categories: Category[] = [];
  dragOver = false;
  fileName = '';

  confirmForm = this.fb.group({
    amount:      [null as number | null, [Validators.required, Validators.min(0.01)]],
    date:        ['', Validators.required],
    description: ['', Validators.required],
    category:    ['', Validators.required],
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((cats) => (this.categories = cats));
  }

  // --- Drag & drop ---
  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(): void {
    this.dragOver = false;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragOver = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) this.processFile(file);
  }

  onFileSelected(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file);
  }

  // --- Upload & parse ---
  private processFile(file: File): void {
    if (file.type !== 'application/pdf') {
      this.notify('Solo se permiten archivos PDF', 'warn');
      return;
    }
    this.fileName = file.name;
    this.state = 'uploading';

    this.receiptService.uploadPdf(file).subscribe({
      next: (data) => {
        this.extracted = data;
        this.prefillForm(data);
        this.state = 'review';
      },
      error: () => {
        this.state = 'upload';
        this.notify('Error al procesar el PDF. Intenta con otro archivo.', 'warn');
      },
    });
  }

  private prefillForm(data: ExtractedReceiptData): void {
    this.confirmForm.patchValue({
      amount: data.extractedAmount,
      date:   data.extractedDate ?? new Date().toISOString().split('T')[0],
      description: this.fileName.replace(/\.pdf$/i, ''),
    });
  }

  // --- Save as expense ---
  save(): void {
    if (this.confirmForm.invalid) return;
    this.state = 'saving';
    const v = this.confirmForm.getRawValue();

    this.expenseService.create({
      amount:      v.amount as number,
      date:        new Date(v.date as string).toISOString(),
      description: v.description as string,
      category:    v.category as string,
    }).subscribe({
      next: () => {
        this.state = 'done';
        this.notify('Gasto registrado correctamente');
      },
      error: () => {
        this.state = 'review';
        this.notify('Error al guardar el gasto', 'warn');
      },
    });
  }

  reset(): void {
    this.state = 'upload';
    this.extracted = null;
    this.fileName = '';
    this.confirmForm.reset();
  }

  getConfidenceBadge(): { label: string; icon: string; css: string } {
    const map = {
      high:   { label: 'Alta confianza',  icon: 'check_circle', css: 'high' },
      medium: { label: 'Confianza media', icon: 'info',         css: 'medium' },
      low:    { label: 'Baja confianza',  icon: 'warning',      css: 'low' },
    };
    return map[this.extracted?.confidence ?? 'low'];
  }

  getErrorMessage(field: string): string {
    const ctrl = this.confirmForm.get(field);
    if (ctrl?.hasError('required')) return 'Campo obligatorio';
    if (ctrl?.hasError('min'))      return 'El monto debe ser mayor a 0';
    return '';
  }

  private notify(msg: string, type = 'ok'): void {
    this.snackBar.open(msg, 'OK', {
      duration: 4000,
      panelClass: type === 'warn' ? ['snack-warn'] : [],
    });
  }
}
