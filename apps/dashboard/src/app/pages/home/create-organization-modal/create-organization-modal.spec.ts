import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateOrganizationModal } from './create-organization-modal';

describe('CreateOrganizationModal', () => {
  let component: CreateOrganizationModal;
  let fixture: ComponentFixture<CreateOrganizationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrganizationModal],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateOrganizationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
