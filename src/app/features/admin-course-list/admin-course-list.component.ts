import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tms-admin-course-list',
  standalone: true,
  templateUrl: './admin-course-list.component.html',
  styleUrl: './admin-course-list.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class AdminCourseListComponent {}
