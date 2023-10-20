import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuldingComponent } from './bulding.component';

describe('BuldingComponent', () => {
  let component: BuldingComponent;
  let fixture: ComponentFixture<BuldingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BuldingComponent]
    });
    fixture = TestBed.createComponent(BuldingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
