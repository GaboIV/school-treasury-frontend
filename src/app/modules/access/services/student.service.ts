import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentResponse } from '../models/student.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/api/v1/Students`

  constructor(private http: HttpClient) { }

  getStudents(): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(this.apiUrl);
  }

  createStudent(student: { name: string, avatar: string }): Observable<any> {
    return this.http.post(this.apiUrl, student);
  }

  updateStudent(id: string, student: { name: string, avatar: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, student);
  }

  deleteStudent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
