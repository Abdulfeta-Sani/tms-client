import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/student-dashboard/student-dashboard.component').then(
        (m) => m.StudentDashboardComponent,
      ),
  },

  {
    path: 'courses',
    loadComponent: () =>
      import('./features/course-catalog/course-catalog.component').then(
        (m) => m.CourseCatalogComponent,
      ),
  },

  {
    path: 'courses/:id',
    loadComponent: () =>
      import('./features/course-detail/course-detail.component').then(
        (m) => m.CourseDetailComponent,
      ),
  },

  {
    path: 'enrollments',
    loadComponent: () =>
      import('./features/enrollment-list/enrollment-list.component').then(
        (m) => m.EnrollmentListComponent,
      ),
  },

  {
    path: 'enroll',
    loadComponent: () =>
      import('./features/enrollment-form/enrollment-form.component').then(
        (m) => m.EnrollmentFormComponent,
      ),
  },

  {
    path: 'enrollment-summary',
    loadComponent: () =>
      import('./features/dashboard-summary/dashboard-summary.component').then(
        (m) => m.DashboardSummaryComponent,
      ),
  },

  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
