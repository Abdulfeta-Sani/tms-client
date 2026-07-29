import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';

@Component({
  selector: 'app-enrollment-form',
  standalone: true,
  imports: [ReactiveFormsModule], // To recognize form directives by Angular
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './enrollment-form.component.html',
})
export class EnrollmentFormComponent {
  // inject(FormBuilder) is Angular's way of requesting a service.
  private fb = inject(FormBuilder);
  submitted = signal(false);

  // fb.nonNullable.group({...}) creates a form object
  form = this.fb.nonNullable.group({
    studentId: ['', [Validators.required, Validators.pattern('^STU-[0-9]{4}$')]],
    courseId: ['', Validators.required],
    term: ['Fall 2026', Validators.required],
    notes: [''],
    backupCourses: this.fb.array<FormControl<string>>([]), // Starts empty, user adds rows dynamically
  });
  // "get backups()" is a TypeScript property accessor runs a function.
  get backups() {
    return this.form.controls.backupCourses;
  }
  // Adds a new empty text input to the backup courses array
  addBackup() {
    this.backups.push(
      this.fb.control('', {
        nonNullable: true,
        validators: Validators.required,
      }),
    );
  }
  // Removes a specific backup course row by its position in the array
  removeBackup(index: number) {
    this.backups.removeAt(index);
  }
  submit() {
    if (this.form.valid) {
      // getRawValue() extracts the full form data as a JSON object.s
      const payload = this.form.getRawValue();
      console.log('Enrollment payload:', payload);
      this.submitted.set(true);
    } else {
      // markAllAsTouched() forces Angular to show validation errors on every field.
      this.form.markAllAsTouched();
    }
  }
}
