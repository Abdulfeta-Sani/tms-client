import { Component, input, output, ChangeDetectionStrategy, inject } from '@angular/core';
import { Course } from '../../models/course.model';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'tms-course-card',
  standalone: true,
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink],
})
export class CourseCardComponent {
  course = input.required<Course>();

  enrollClicked = output<Course>();
  deleteClicked = output<number>();
  enrollDisabled = input(false);
  canEnroll = input(false);

  public readonly auth = inject(AuthService);
}
