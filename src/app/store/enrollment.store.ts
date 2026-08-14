import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { setAllEntities, updateEntity, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, concatMap, catchError, filter, pipe, switchMap, tap } from 'rxjs';

import { EnrollmentService } from '../services/enrollment.service';
import { LiveSyncService } from '../services/live-sync.service';
import { Enrollment } from '../models/enrollment.model';

export const EnrollmentStore = signalStore(
  { providedIn: 'root' },

  withState({
    isLoading: false,
    error: null as string | null,
    hasLoaded: false,
  }),

  withEntities<Enrollment>(),

  withComputed((store) => ({
    pendingCount: computed(() => store.entities().filter((e) => e.status === 'Pending').length),
  })),

  withMethods((store, api = inject(EnrollmentService), sync = inject(LiveSyncService)) => ({
    loadEnrollments: rxMethod<void>(
      pipe(
        filter(() => !store.hasLoaded()), // Prevent re-fetching on route re-entry so API data does not overwrite in-memory approval state.
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

              patchState(store, setAllEntities(enrollments), {
                isLoading: false,
                hasLoaded: true,
              });
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
      ),
    ),

    listenForLiveUpdates: rxMethod<void>(
      pipe(
        tap(() => sync.connect()),
        switchMap(() => sync.events$),
        tap((event) => {
          patchState(
            store,
            updateEntity({
              id: event.id,
              changes: { status: event.status },
            }),
          );
        }),
      ),
    ),
  })),
);
