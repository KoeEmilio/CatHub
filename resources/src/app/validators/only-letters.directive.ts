import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import { CustomValidators } from './custom-validators';

@Directive({
  selector: '[appOnlyLetters]',
  standalone: true,
  providers: [
    { provide: NG_VALIDATORS, useExisting: OnlyLettersDirective, multi: true },
  ],
})
export class OnlyLettersDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return CustomValidators.onlyLetters()(control);
  }
}