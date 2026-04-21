import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpedizioneComponent } from './spedizione-component';

describe('SpedizioneComponent', () => {
  let component: SpedizioneComponent;
  let fixture: ComponentFixture<SpedizioneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpedizioneComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpedizioneComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
