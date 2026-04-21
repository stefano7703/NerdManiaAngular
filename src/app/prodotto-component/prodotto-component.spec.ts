import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdottoComponent } from './prodotto-component';

describe('ProdottoComponent', () => {
  let component: ProdottoComponent;
  let fixture: ComponentFixture<ProdottoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdottoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProdottoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
