import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProdottoComponent } from './admin-prodotto-component';

describe('AdminProdottoComponent', () => {
  let component: AdminProdottoComponent;
  let fixture: ComponentFixture<AdminProdottoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProdottoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProdottoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
