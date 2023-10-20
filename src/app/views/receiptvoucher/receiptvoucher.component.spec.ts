import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptvoucherComponent } from './receiptvoucher.component';

describe('ReceiptvoucherComponent', () => {
  let component: ReceiptvoucherComponent;
  let fixture: ComponentFixture<ReceiptvoucherComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReceiptvoucherComponent]
    });
    fixture = TestBed.createComponent(ReceiptvoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
