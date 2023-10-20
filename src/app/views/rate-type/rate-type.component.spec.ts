import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RateTypeComponent } from './rate-type.component';

describe('RateTypeComponent', () => {
  let component: RateTypeComponent;
  let fixture: ComponentFixture<RateTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RateTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RateTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
