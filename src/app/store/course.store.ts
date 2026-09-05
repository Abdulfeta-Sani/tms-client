import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { removeEntity, setAllEntities, updateEntity, withEntities } from '@ngrx/signals/entities';
import { EMPTY, catchError, tap } from 'rxjs';

import { Course } from '../models/course.model';
import { CourseService } from '../services/course.service';

export const CourseStore = signalStore(
  { providedIn: 'root' },

  withState({
    isLoading: false,
    error: null as string | null,
    hasLoaded: false,
  }),

  withEntities<Course>(),

  withMethods((store, svc = inject(CourseService)) => ({
    loadCourses() {
      patchState(store, { isLoading: true, error: null });

      svc
        .getAll()
        .pipe(
          tap((rows) => {
            patchState(store, setAllEntities(rows), {
              isLoading: false,
              hasLoaded: true,
            });
          }),
          catchError((err) => {
            patchState(store, {
              isLoading: false,
              error: err.message || 'Failed to load courses.',
            });
            return EMPTY;
          }),
        )
        .subscribe();
    },

    incrementEnrollmentCount(courseId: number): void {
      const course = store.entityMap()[courseId];

      if (!course) {
        return;
      }

      patchState(
        store,
        updateEntity({
          id: courseId,
          changes: {
            enrollmentCount: course.enrollmentCount + 1,
          },
        }),
      );
    },

    deleteCourse(id: number) {
      const previousSnapshot = store.entities();

      patchState(store, removeEntity(id));

      svc
        .delete(id)
        .pipe(
          catchError(() => {
            patchState(store, setAllEntities(previousSnapshot));
            return EMPTY;
          }),
        )
        .subscribe();
    },
  })),
);
