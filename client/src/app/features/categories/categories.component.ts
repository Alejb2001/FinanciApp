import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models';
import { CategoryFormComponent } from './category-form/category-form.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  categories: Category[] = [];
  loading = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: (data) => { this.categories = data; this.loading = false; },
      error: () => { this.loading = false; this.notify('Error al cargar categorías'); },
    });
  }

  openForm(category?: Category): void {
    const ref = this.dialog.open(CategoryFormComponent, {
      width: '420px',
      disableClose: true,
      data: category ?? null,
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.load();
        this.notify(category ? 'Categoría actualizada' : 'Categoría creada');
      }
    });
  }

  delete(category: Category): void {
    if (!confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    this.categoryService.delete(category._id).subscribe({
      next: () => { this.load(); this.notify('Categoría eliminada'); },
      error: () => this.notify('Error al eliminar'),
    });
  }

  private notify(msg: string): void {
    this.snackBar.open(msg, 'OK', { duration: 3000 });
  }
}
