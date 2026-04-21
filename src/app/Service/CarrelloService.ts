import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CarrelloDto } from '../Dto/CarrelloDto';
import { UserDto } from '../Dto/UserDto';
import { AbstractService } from './abstract-service';

@Injectable({
	providedIn: 'root',
})
export class CarrelloService extends AbstractService<CarrelloDto> {
	constructor(http: HttpClient) {
		super(http);
		this.type = 'Carrello';
	}

	findByUser(user: UserDto): Observable<CarrelloDto> {
		const params = new HttpParams().set('id', String(user.id));
		return this.http.get<CarrelloDto>(`${this.baseUrl}/${this.type}/findByUser`, { params });
	}

	findCarrelliAttivi(): Observable<CarrelloDto[]> {
		return this.http.get<CarrelloDto[]>(`${this.baseUrl}/${this.type}/findCarrelliAttivi`);
	}

	findByPrezzoTotaleGreaterThan(prezzo: number): Observable<CarrelloDto[]> {
		const params = new HttpParams().set('prezzo', String(prezzo));
		return this.http.get<CarrelloDto[]>(`${this.baseUrl}/${this.type}/findByPrezzoTotaleGreaterThan`, { params });
	}

	findByQuantitaGreaterThan(quantita: number): Observable<CarrelloDto[]> {
		const params = new HttpParams().set('quantita', String(quantita));
		return this.http.get<CarrelloDto[]>(`${this.baseUrl}/${this.type}/findByQuantitaGreaterThan`, { params });
	}

	findByPesoLessThan(peso: number): Observable<CarrelloDto[]> {
		const params = new HttpParams().set('peso', String(peso));
		return this.http.get<CarrelloDto[]>(`${this.baseUrl}/${this.type}/findByPesoLessThan`, { params });
	}
}
