import { userService } from '../Service/userService';
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { UserDto } from '../Dto/UserDto';
import { CarrelloDto } from '../Dto/CarrelloDto';
import { AddUserComponent } from '../addOn/add-user-component/add-user-component';
import { AuthService } from '../Service/AuthService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-component.html',
  styleUrl: './user-component.css',
})
export class UserComponent implements OnInit {

  showAddUser = signal(false);

  users = signal<UserDto[]>([]);

  user = signal<UserDto>(
    new UserDto(
      0,
      '',
      '',
      '',
      '',
      '',
      '',
      false,
      new CarrelloDto(0, 0, 0),
      null
    )
  );

  ordineAperto: number | null = null;

  ordineAperto: number | null = null;



  checkResult = signal<{ message: string; exists: boolean | null }>({
    message: '',
    exists: null,
  });


  constructor(
    private service: userService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    const loggedUser = this.authService.getUser();

    if (loggedUser) {
      this.user.set(loggedUser);
    }
  }

  toggleSpedizione(id: number) {
  this.ordineAperto = this.ordineAperto === id ? null : id;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isLogged() {
    return this.authService.isLoggedIn();
  }

  goLogin() {
  this.router.navigate(['/login']);
}

}
