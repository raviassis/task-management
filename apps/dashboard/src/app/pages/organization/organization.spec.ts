import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { OrganizationPage } from './organization';

describe('Organization', () => {
  let component: OrganizationPage;
  let fixture: ComponentFixture<OrganizationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ organizationId: '1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
