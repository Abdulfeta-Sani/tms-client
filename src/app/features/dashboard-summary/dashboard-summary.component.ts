import { Component, inject, OnInit } from '@angular/core';
import { EnrollmentStore } from '../../store/enrollment.store';

@Component({
  selector: 'tms-dashboard-summary',
  standalone: true,
  templateUrl: './dashboard-summary.component.html',
  styleUrl: './dashboard-summary.component.scss',
})
export class DashboardSummaryComponent implements OnInit {
  readonly store = inject(EnrollmentStore);

  // runs once when this component opens. It asks the store to load data
  ngOnInit() {
    this.store.loadEnrollments();
  }
}
