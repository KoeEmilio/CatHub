import { Component, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { OnlyLettersDirective } from '../../validators/only-letters.directive';
import { UniqueEmailDirective } from '../../validators/unique-email.directive';

@Component({
  selector: 'app-user-template-driven',
  standalone: true,
  imports: [CommonModule, FormsModule, OnlyLettersDirective, UniqueEmailDirective],
  templateUrl: './user-template-driven.component.html',
  styleUrl: './user-template-driven.component.scss',
})
export class UserTemplateDrivenComponent {
  user = { fullName: '', email: '', password: '' };
  apiService = inject(ApiService);

  onSubmit(form: NgForm) {
    if (form.invalid || form.pending) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      alert('Por favor corrige los errores en el formulario');
      return;
    }
    this.apiService.create('users', this.user).subscribe({
      next: () => {
        alert('Usuario creado correctamente');
        form.resetForm();
      },
      error: (error) => {
        if (error.error.errors) {
          alert(
            Array.isArray(error.error.errors)
              ? error.error.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n')
              : error.error.errors
          );
        } else {
          alert(`Error: ${error.error.message}`);
        }
      },
    });
  }
}
