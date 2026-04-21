import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface Service<Dto> {

  read(id: number): Observable<Dto>;
  delete(id: number): Observable<any>;
  update(dto: Dto): Observable<any>;
  insert(dto: Dto): Observable<any>;

  getAll(): Observable<Dto[]>;
}
