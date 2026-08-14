import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GradePayload {
  studentId: number;
  courseId: number;
  score: number;
}

@Service()
export class GradeService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5249/api/grades';

  postGrade(payload: GradePayload): Observable<{ id: string; success: boolean }> {
    return this.http.post<{ id: string; success: boolean }>(this.baseUrl, payload);
  }
}
