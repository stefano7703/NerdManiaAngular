import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSpedizioniComponent } from './admin-spedizioni-component';

describe('AdminSpedizioniComponent', () => {
  let component: AdminSpedizioniComponent;
  let fixture: ComponentFixture<AdminSpedizioniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSpedizioniComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSpedizioniComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
