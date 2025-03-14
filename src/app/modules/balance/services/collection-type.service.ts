import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CollectionTypeResponse, CollectionType, CollectionTypeAll } from '../models/collection-type.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CollectionTypeService {
  private apiUrl = `${environment.apiUrl}/api/v1/collection-types`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<CollectionTypeAll> {
    return this.http.get<CollectionTypeAll>(`${this.apiUrl}`);
  }

  getCollectionTypes(page: number = 1, limit: number = 50): Observable<CollectionTypeResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', limit.toString());

    return this.http.get<CollectionTypeResponse>(`${this.apiUrl}/paginated`, { params });
  }

  createCollectionType(collectionType: { name: string }): Observable<CollectionTypeResponse> {
    return this.http.post<CollectionTypeResponse>(this.apiUrl, collectionType);
  }

  updateCollectionType(collectionType: { id: string, name: string }): Observable<CollectionTypeResponse> {
    return this.http.put<CollectionTypeResponse>(`${this.apiUrl}`, collectionType);
  }

  deleteCollectionType(id: string): Observable<CollectionTypeResponse> {
    return this.http.delete<CollectionTypeResponse>(`${this.apiUrl}/${id}`);
  }
}
