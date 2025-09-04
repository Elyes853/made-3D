import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomOrderComponent } from './custom-order.component';

describe('CustomOrderComponent', () => {
  let component: CustomOrderComponent;
  let fixture: ComponentFixture<CustomOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
