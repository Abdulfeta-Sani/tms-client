import { Component, inject, signal } from '@angular/core';
import { CourseCardComponent } from '../../ui/course-card/course-card.component';
import { Course } from '../../models/course.model';
import { CourseStore } from '../../store/course.store';

@Component({
  selector: 'tms-course-catalog',
  standalone: true,
  imports: [CourseCardComponent],
  templateUrl: './course-catalog.component.html',
  styleUrl: './course-catalog.component.scss',
})
export class CourseCatalogComponent {
  public readonly store = inject(CourseStore);

  selectedCourse = signal<Course | null>(null);

  constructor() {
    this.store.loadCourses();
  }

  handleEnroll(course: Course) {
    this.selectedCourse.set(course);
    console.log('Enrollment requested for:', course.title);
  }

  handleDelete(courseId: number) {
    this.store.deleteCourse(courseId);
  }
}
