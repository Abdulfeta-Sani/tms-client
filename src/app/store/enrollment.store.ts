import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withMethods, patchState, withState } from '@ngrx/signals';
import { withEntities, setAllEntities, updateEntity } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, concatMap, tap, catchError, EMPTY } from 'rxjs';

import { EnrollmentService } from '../services/enrollment.service';
import { Enrollment } from '../models/enrollment.model';

export const EnrollmentStore = signalStore(
  { providedIn: 'root' },

  // Simple UI state
  withState({
    isLoading: false,
    error: null as string | null,
  }),

  // Entity collection
  withEntities<Enrollment>(),

  // Derived values
  withComputed((store) => ({
    pendingCount: computed(() => store.entities().filter((e) => e.status === 'Pending').length),
  })),

  // Actions
  withMethods((store, api = inject(EnrollmentService)) => ({
    loadEnrollments: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),

        concatMap(() =>
          api.getAll().pipe(
            tap((rows) => patchState(store, setAllEntities(rows), { isLoading: false })),

            catchError((err) => {
              patchState(store, { isLoading: false, error: err.message });

              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    approveEnrollment: rxMethod<string>(
      pipe(
        tap((id) => {
          patchState(store, updateEntity({ id, changes: { status: 'Approved' } }));
        }),

        concatMap((id) =>
          api.approve(id).pipe(
            catchError(() => {
              patchState(store, updateEntity({ id, changes: { status: 'Pending' } }));

              patchState(store, {
                error: 'Server rejected the approval. Check enrollment constraints.',
              });

              return EMPTY;
            }),
          ),
        ),
      ),
    ),
  })),
);
