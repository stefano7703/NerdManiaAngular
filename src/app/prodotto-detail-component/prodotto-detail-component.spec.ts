import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdottoDetailComponent } from './prodotto-detail-component';

describe('ProdottoDetailComponent', () => {
  let component: ProdottoDetailComponent;
  let fixture: ComponentFixture<ProdottoDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdottoDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProdottoDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
