import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreBoard } from './score-board';

describe('ScoreBoard', () => {
  let component: ScoreBoard;
  let fixture: ComponentFixture<ScoreBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreBoard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreBoard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
