import { Directive, Input } from '@angular/core';
import { NG_ASYNC_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import { CustomValidators } from './custom-validators';
import { ApiService } from '../services/api.service';
import { Observable } from 'rxjs';

@Directive({
  selector: '[appUniqueEmail]',
  standalone: true,
  providers: [
    { provide: NG_ASYNC_VALIDATORS, useExisting: UniqueEmailDirective, multi: true },
  ],
})
export class UniqueEmailDirective implements Validator {
  @Input('appUniqueEmail') apiService!: ApiService;

  validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return CustomValidators.uniqueEmail(this.apiService)(control);
  }
}