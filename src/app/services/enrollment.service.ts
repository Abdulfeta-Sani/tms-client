import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Enrollment } from '../models/enrollment.model';
import { environment } from '../../environments/environment';
import { EnrollmentCreated } from '../models/enrollment-created.model';

@Service()
export class EnrollmentService {
  private http = inject(HttpClient);
  private readonly listUrl = `${environment.apiRoot}/enrollments`;
  private readonly approveUrl = `${environment.apiV2}/enrollments`;

  getAll(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(this.listUrl);
  }

  enroll(courseCode: string): Observable<EnrollmentCreated> {
    return this.http.post<EnrollmentCreated>(`${environment.apiV2}/enrollments`, { courseCode });
  }

  approve(id: string): Observable<void> {
    return this.http.post<void>(`${this.approveUrl}/${id}/approve`, {});
  }
}
