import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bullet } from './bullet';

describe('Bullet', () => {
  let component: Bullet;
  let fixture: ComponentFixture<Bullet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bullet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bullet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
