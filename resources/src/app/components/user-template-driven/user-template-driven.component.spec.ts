import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTemplateDrivenComponent } from './user-template-driven.component';

describe('UserTemplateDrivenComponent', () => {
  let component: UserTemplateDrivenComponent;
  let fixture: ComponentFixture<UserTemplateDrivenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTemplateDrivenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserTemplateDrivenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
