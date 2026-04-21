import { Injectable } from '@angular/core';
import { Service } from './service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export abstract class AbstractService<DTO> implements Service<DTO> {

  type: string |undefined = '';
  port: string = '8080';
  baseUrl: string = 'http://localhost:' + this.port;

  constructor(protected http: HttpClient) {
  }

    getAll(): Observable<DTO[]> {
      return this.http.get<DTO[]>(this.baseUrl + '/' + this.type + '/getAll');
    }

    read(id: number): Observable<DTO> {
      return this.http.get<DTO>(this.baseUrl + '/' + this.type + '/read?id=' + id);
    }

    delete(id: number): Observable<any> {
      return this.http.delete(this.baseUrl + '/' + this.type + '/delete?id=' + id);
    }

    update(dto: DTO): Observable<any> {
      return this.http.put(this.baseUrl + '/' + this.type + '/update', dto);
    }

    insert(dto: DTO): Observable<any> {
      return this.http.post(this.baseUrl + '/' + this.type + '/insert', dto);
    }

}
