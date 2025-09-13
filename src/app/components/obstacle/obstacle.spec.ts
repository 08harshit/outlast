import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Obstacle } from './obstacle';

describe('Obstacle', () => {
  let component: Obstacle;
  let fixture: ComponentFixture<Obstacle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Obstacle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Obstacle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
