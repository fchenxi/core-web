import { ResetPasswordComponent } from '@components/login/reset-password-component/reset-password.component';
import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { DOTTestBed } from '@tests/dot-test-bed';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginService } from 'dotcms-js';
import { LoginServiceMock } from '@tests/login-service.mock';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/primeng';
import { DotFieldValidationMessageModule } from '@components/_common/dot-field-validation-message/dot-file-validation-message.module';
import { DotLoginPageStateService } from '@components/login/shared/services/dot-login-page-state.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { DotRouterService } from '@services/dot-router/dot-router.service';
import { MockDotLoginPageStateService } from '@components/login/dot-login-page-resolver.service.spec';
import { MdInputTextModule } from '@directives/md-inputtext/md-input-text.module';

describe('ResetPasswordComponent', () => {
    let component: ResetPasswordComponent;
    let fixture: ComponentFixture<ResetPasswordComponent>;
    let de: DebugElement;
    let loginService: LoginService;
    let activatedRoute: ActivatedRoute;
    let dotRouterService: DotRouterService;

    beforeEach(() => {
        DOTTestBed.configureTestingModule({
            declarations: [ResetPasswordComponent],
            imports: [
                BrowserAnimationsModule,
                FormsModule,
                ButtonModule,
                InputTextModule,
                MdInputTextModule,
                DotFieldValidationMessageModule,
                RouterTestingModule
            ],
            providers: [
                { provide: LoginService, useClass: LoginServiceMock },
                { provide: DotLoginPageStateService, useClass: MockDotLoginPageStateService }
            ]
        });

        fixture = DOTTestBed.createComponent(ResetPasswordComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        activatedRoute = de.injector.get(ActivatedRoute);
        loginService = de.injector.get(LoginService);
        dotRouterService = de.injector.get(DotRouterService);
        spyOn(activatedRoute.snapshot.paramMap, 'get').and.returnValue('test@test.com');
        spyOn(loginService, 'changePassword').and.callThrough();
        fixture.detectChanges();

        this.changePasswordButton = de.query(By.css('button[type="submit"]'));
    });

    it('should load form labels correctly', () => {
        const header: DebugElement = de.query(By.css('h3'));
        const inputs: DebugElement[] = de.queryAll(By.css('span[dotmdinputtext] label'));
        const button: DebugElement = de.query(By.css('button'));

        expect(header.nativeElement.innerHTML).toEqual('Password Reset');
        expect(inputs[0].nativeElement.innerHTML).toContain('Enter Password');
        expect(inputs[1].nativeElement.innerHTML).toContain('Confirm Password');
        expect(button.nativeElement.innerHTML).toContain('Change Password');
    });

    it('should keep change password button disabled until the form is valid', () => {
        expect(this.changePasswordButton.nativeElement.disabled).toBe(true);
    });

    it('should display message if passwords do not match', () => {
        component.resetPasswordForm.setValue({
            password: 'test',
            confirmPassword: 'test2'
        });
        this.changePasswordButton.triggerEventHandler('click', {});
        fixture.detectChanges();
        const errorMessage = de.queryAll(By.css('.error-message'));

        expect(errorMessage.length).toBe(1);
        expect(loginService.changePassword).not.toHaveBeenCalled();
    });

    it('should call the change password service and redirect to loging page', () => {
        component.resetPasswordForm.setValue({
            password: 'test',
            confirmPassword: 'test'
        });
        this.changePasswordButton.triggerEventHandler('click', {});
        expect(loginService.changePassword).toHaveBeenCalledWith('test', 'test@test.com');
        expect(dotRouterService.goToLogin).toHaveBeenCalledWith({ changedPassword: true });
    });

    it('should show error message for required form fields', () => {
        component.resetPasswordForm.get('password').markAsDirty();
        component.resetPasswordForm.get('confirmPassword').markAsDirty();
        fixture.detectChanges();

        const errorMessages = de.queryAll(By.css('.ui-messages-error'));
        expect(errorMessages.length).toBe(2);
    });
});
