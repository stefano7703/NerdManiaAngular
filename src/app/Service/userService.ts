import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserDto } from '../Dto/UserDto';
import { AbstractService } from './abstract-service';

@Injectable({
  providedIn: 'root',
})
export class userService extends AbstractService<UserDto>{

  private baseProjectUrl: string = '';

  constructor(http: HttpClient) {
    super(http);
    this.type = 'User';
    this.baseProjectUrl = this.baseProjectUrl + '/' + this.type;
  }


  findByNomeContainingIgnoreCase(nome: string) {
    return this.http.get<UserDto[]>(`${this.baseProjectUrl}/findByNomeContainingIgnoreCase?nome=${nome}`);
  }

  findByCartaFedeltaTrue() {
    return this.http.get<UserDto[]>(`${this.baseProjectUrl}/findByCartaFedeltaTrue`);
  }

  findByCartaFedeltaFalse() {
    return this.http.get<UserDto[]>(`${this.baseProjectUrl}/findByCartaFedeltaFalse`);
  }

  exiexistsByUsername(username: string) {
    return this.http.get<boolean>(`${this.baseProjectUrl}/existsByUsername?username=${username}`);
  }

  exiexistsByEmail(email: string) {
    return this.http.get<boolean>(`${this.baseProjectUrl}/existsByEmail?email=${email}`);
  }
}
