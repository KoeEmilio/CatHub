import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from "@angular/forms";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs";

export class CustomValidators {
    static onlyLetters(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(control.value)) {
                return { onlyLetters: 'Only letters are allowed' };
            }
            return null;
        }
    }

    static uniqueEmail(apiService: any): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            if (!control.value) return of(null);
            return apiService.getAll('users').pipe(
                map((users: any[]) => {
                    const emailExists = users.some(user => user.email === control.value);
                    return emailExists ? { uniqueEmail: 'Email already exists' } : null;
                }),
                catchError(() => of(null))
            );
        };
    }
}
