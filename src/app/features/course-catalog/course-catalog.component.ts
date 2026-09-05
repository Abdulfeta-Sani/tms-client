import { Component, inject, signal } from '@angular/core';
import { CourseCardComponent } from '../../ui/course-card/course-card.component';
import { Course } from '../../models/course.model';
import { CourseStore } from '../../store/course.store';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { EnrollmentService } from '../../services/enrollment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'tms-course-catalog',
  standalone: true,
  imports: [CourseCardComponent],
  templateUrl: './course-catalog.component.html',
  styleUrl: './course-catalog.component.scss',
})
export class CourseCatalogComponent {
  public readonly store = inject(CourseStore);
  private readonly enrollmentService = inject(EnrollmentService);
  readonly auth = inject(AuthService);

  isEnrolling = signal(false);
  enrollmentMessage = signal('');
  enrollmentError = signal('');
  selectedCourse = signal<Course | null>(null);
  enrolledCourseCodes = signal(new Set<string>());

  constructor() {
    this.store.loadCourses();
  }

  async handleEnroll(course: Course): Promise<void> {
    this.selectedCourse.set(course);
    this.enrollmentMessage.set('');
    this.enrollmentError.set('');
    this.isEnrolling.set(true);

    try {
      await firstValueFrom(this.enrollmentService.enroll(course.code));

      this.store.incrementEnrollmentCount(course.id);

      this.enrolledCourseCodes.update((codes) => {
        const updatedCodes = new Set(codes);
        updatedCodes.add(course.code);
        return updatedCodes;
      });

      this.enrollmentMessage.set(`Enrollment request submitted for ${course.title}.`);
    } catch (error: unknown) {
      const httpError = error as HttpErrorResponse;
      const detail = httpError.error?.detail || 'The enrollment request could not be completed.';

      this.enrollmentError.set(detail);
    } finally {
      this.isEnrolling.set(false);
    }
  }

  handleDelete(courseId: number) {
    this.store.deleteCourse(courseId);
  }
}
