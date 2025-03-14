import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CollectionResponse } from '../models/collection.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private apiUrl = `${environment.apiUrl}/api/v1/collections`;

  constructor(private http: HttpClient) { }

  getCollections(page: number = 1, limit: number = 50): Observable<CollectionResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', limit.toString());

    return this.http.get<CollectionResponse>(`${this.apiUrl}/paginated`, { params });
  }

  createCollection(collection: { name: string }): Observable<CollectionResponse> {
    return this.http.post<CollectionResponse>(this.apiUrl, collection);
  }

  updateCollection(collection: { id: string, name: string }): Observable<CollectionResponse> {
    return this.http.put<CollectionResponse>(`${this.apiUrl}`, collection);
  }

  deleteCollection(id: string): Observable<CollectionResponse> {
    return this.http.delete<CollectionResponse>(`${this.apiUrl}/${id}`);
  }

  updateCollectionAdjustedAmount(collection: { id: string, adjustedAmount: number, surplus: number }): Observable<ApiResponse<any>> {
    console.log(`ID: ${collection.id}, Monto Ajustado: ${collection.adjustedAmount}, Excedente: ${collection.surplus}`);
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${collection.id}/adjust-amount`, collection);
  }
}
