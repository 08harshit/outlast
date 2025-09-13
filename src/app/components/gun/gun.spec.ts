import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gun } from './gun';

describe('Gun', () => {
  let component: Gun;
  let fixture: ComponentFixture<Gun>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gun]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gun);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
