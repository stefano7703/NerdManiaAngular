import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMagazzinoComponent } from './admin-magazzino-component';

describe('AdminMagazzinoComponent', () => {
  let component: AdminMagazzinoComponent;
  let fixture: ComponentFixture<AdminMagazzinoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMagazzinoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminMagazzinoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
