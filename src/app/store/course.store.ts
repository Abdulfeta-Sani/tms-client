import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { removeEntity, setAllEntities, withEntities } from '@ngrx/signals/entities';
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

    deleteCourse(id: number) {
      const previousSnapshot = store.entities();

      patchState(store, removeEntity(id));

      svc
        .delete(id)
        .pipe(
          catchError((err) => {
            patchState(store, setAllEntities(previousSnapshot));
            patchState(store, {
              error: 'Cannot delete course: active student enrollments exist.',
            });
            return EMPTY;
          }),
        )
        .subscribe();
    },
  })),
);
