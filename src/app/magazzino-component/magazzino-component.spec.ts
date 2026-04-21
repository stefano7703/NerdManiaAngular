import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagazzinoComponent } from './magazzino-component';

describe('MagazzinoComponent', () => {
  let component: MagazzinoComponent;
  let fixture: ComponentFixture<MagazzinoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagazzinoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MagazzinoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
