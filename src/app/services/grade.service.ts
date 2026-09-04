import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface GradePayload {
  studentId: number;
  courseId: number;
  score: number;
}

@Service()
export class GradeService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiRoot}/grades`;

  postGrade(payload: GradePayload): Observable<{ id: string; success: boolean }> {
    return this.http.post<{ id: string; success: boolean }>(this.baseUrl, payload);
  }
}
