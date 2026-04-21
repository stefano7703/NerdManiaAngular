import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdineComponent } from './ordine-component';

describe('OrdineComponent', () => {
  let component: OrdineComponent;
  let fixture: ComponentFixture<OrdineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdineComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdineComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
