import { Component, signal, computed } from '@angular/core';
import { CourseCardComponent } from '../../ui/course-card/course-card.component';
import { Course } from '../../models/course.model';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CourseCardComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss',
})
export class StudentDashboardComponent {
  studentName = signal('Liya Kebede');

  earnedCredits = signal(45);

  graduationStatus = computed(() =>
    this.earnedCredits() >= 120 ? 'Eligible for Graduation' : 'In Progress',
  );

  registerForClass() {
    this.earnedCredits.update((c) => c + 3);
  }

  selectedCourse = signal<Course | null>(null);
  // A sample course to display (we will switch to an array in Excercise3)
  sampleCourse: Course = {
    id: 1,
    title: 'Advanced Java Services',
    code: 'CSE-101',
    maxCapacity: 30,
    enrollmentCount: 12,
  };
  handleEnroll(course: Course) {
    this.selectedCourse.set(course);
    console.log('Enrollment requested for:', course.title);
  }
}
