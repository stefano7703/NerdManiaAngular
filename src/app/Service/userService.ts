import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserDto } from '../Dto/UserDto';
import { AbstractService } from './abstract-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class userService extends AbstractService<UserDto> {
  private baseProjectUrl: string = '';

  constructor(http: HttpClient) {
    super(http);
    this.type = 'User';
    this.baseProjectUrl = this.baseUrl + '/' + this.type;
  }

  findByNomeContainingIgnoreCase(nome: string): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(
      `${this.baseProjectUrl}/findByNomeContainingIgnoreCase?nome=${nome}`,
    );
  }

  findByCartaFedeltaTrue(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.baseProjectUrl}/findByCartaFedeltaTrue`);
  }

  findByCartaFedeltaFalse(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.baseProjectUrl}/findByCartaFedeltaFalse`);
  }

  exiexistsByUsername(username: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseProjectUrl}/exiexistsByUsername?username=${username}`,
    );
  }

  exiexistsByEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseProjectUrl}/exiexistsByEmail?email=${email}`);
  }

  register(user: UserDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.baseProjectUrl}/register`, user);
  }

  updateCartaFedelta(id: number, value: boolean) {
    return this.http.patch(`${this.baseProjectUrl}/updateCartaFedelta?id=${id}&value=${value}`, {});
  }
}
