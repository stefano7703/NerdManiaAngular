import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOrdiniComponent } from './admin-ordini-component';

describe('AdminOrdiniComponent', () => {
  let component: AdminOrdiniComponent;
  let fixture: ComponentFixture<AdminOrdiniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOrdiniComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOrdiniComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
