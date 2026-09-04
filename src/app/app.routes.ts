import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

import { AdminCourseListComponent } from './features/admin-course-list/admin-course-list.component';
import { UnauthorizedComponent } from './features/unauthorized/unauthorized.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((module) => module.LoginComponent),
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./features/register/register.component').then((module) => module.RegisterComponent),
  },

  {
    path: 'dashboard',
    canActivate: [roleGuard('Instructor')],
    loadComponent: () =>
      import('./features/instructor-dashboard/instructor-dashboard.component').then(
        (module) => module.InstructorDashboardComponent,
      ),
  },

  {
    path: 'student-dashboard',
    canActivate: [roleGuard('Student')],
    loadComponent: () =>
      import('./features/student-dashboard/student-dashboard.component').then(
        (module) => module.StudentDashboardComponent,
      ),
  },

  {
    path: 'enrollment-summary',
    canActivate: [roleGuard('Instructor')],
    loadComponent: () =>
      import('./features/dashboard-summary/dashboard-summary.component').then(
        (module) => module.DashboardSummaryComponent,
      ),
  },

  {
    path: 'enrollments',
    canActivate: [roleGuard('Instructor')],
    loadComponent: () =>
      import('./features/enrollment-list/enrollment-list.component').then(
        (module) => module.EnrollmentListComponent,
      ),
  },

  {
    path: 'enroll',
    canActivate: [roleGuard('Student')],
    loadComponent: () =>
      import('./features/enrollment-form/enrollment-form.component').then(
        (module) => module.EnrollmentFormComponent,
      ),
  },

  {
    path: 'courses',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/course-catalog/course-catalog.component').then(
        (module) => module.CourseCatalogComponent,
      ),
  },

  {
    path: 'courses/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/course-detail/course-detail.component').then(
        (module) => module.CourseDetailComponent,
      ),
  },

  {
    path: 'grade-submission',
    canActivate: [roleGuard('Instructor')],
    loadComponent: () =>
      import('./features/grade-submission/grade-submission.component').then(
        (module) => module.GradeSubmissionComponent,
      ),
  },

  {
    path: 'admin/courses',
    canActivate: [roleGuard('Admin')],
    component: AdminCourseListComponent,
  },

  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
