import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withMethods, patchState, withState } from '@ngrx/signals';
import { withEntities, setAllEntities, updateEntity } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, concatMap, tap, catchError, EMPTY, filter } from 'rxjs';

import { EnrollmentService } from '../services/enrollment.service';
import { Enrollment } from '../models/enrollment.model';

export const EnrollmentStore = signalStore(
  { providedIn: 'root' },

  // Simple UI state
  withState({
    isLoading: false,
    error: null as string | null,
    hasLoaded: false,
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
        // Prevent re-fetching on route re-entry so API data does not overwrite in-memory approval state.

        filter(() => !store.hasLoaded()),
        tap(() => patchState(store, { isLoading: true, error: null })),

        concatMap(() =>
          api.getAll().pipe(
            // tap((rows) => patchState(store, setAllEntities(rows), { isLoading: false })),

            // Convert API rows into frontend state by normalizing IDs and assigning a temporary client-side Pending status.

            tap((rows) => {
              const enrollments: Enrollment[] = rows.map((row) => ({
                ...row,
                id: String(row.id),
                status: 'Pending',
              }));

              patchState(store, setAllEntities(enrollments), { isLoading: false, hasLoaded: true });
            }),

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

        // The API has no approve endpoint yet, so approval is temporarily managed only in the shared Angular store.

        // concatMap((id) =>
        //   api.approve(id).pipe(
        //     catchError(() => {
        //       patchState(store, updateEntity({ id, changes: { status: 'Pending' } }));

        //       patchState(store, {
        //         error: 'Server rejected the approval. Check enrollment constraints.',
        //       });

        //       return EMPTY;
        //     }),
        //   ),
        // ),
      ),
    ),
  })),
);
