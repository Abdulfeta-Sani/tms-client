import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { CourseCardComponent } from '../../ui/course-card/course-card.component';
import { Course } from '../../models/course.model';
import { CourseService } from '../../services/course.service';
import { EnrollmentStore } from '../../store/enrollment.store';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CourseCardComponent, RouterLink],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss',
})
export class StudentDashboardComponent implements OnInit {
  private api = inject(CourseService);
  store = inject(EnrollmentStore);

  studentName = signal('Liya Kebede');
  earnedCredits = signal(45);

  graduationStatus = computed(() =>
    this.earnedCredits() >= 120 ? 'Eligible for Graduation' : 'In Progress',
  );

  coursesResource = rxResource({
    stream: () => this.api.getAll(),
  });

  selectedCourse = signal<Course | null>(null);

  ngOnInit() {
    this.store.loadEnrollments();
  }

  registerForClass() {
    this.earnedCredits.update((credits) => credits + 3);
  }

  handleEnroll(course: Course) {
    this.selectedCourse.set(course);

    console.log('Enrollment requested for:', course.title);
  }
}
