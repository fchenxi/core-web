import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DotAddPersonaDialogComponent } from './dot-add-persona-dialog.component';
import { MockDotMessageService } from '@tests/dot-message-service.mock';

import { DOTTestBed } from '@tests/dot-test-bed';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DotMessageService } from '@services/dot-messages-service';
import { DotDialogModule } from '@components/dot-dialog/dot-dialog.module';
import { DotWorkflowActionsFireService } from '@services/dot-workflow-actions-fire/dot-workflow-actions-fire.service';
import { Component, DebugElement, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DotHttpErrorManagerService } from '@services/dot-http-error-manager/dot-http-error-manager.service';
import { LoginService, SiteService } from 'dotcms-js';
import { LoginServiceMock } from '@tests/login-service.mock';
import { mockDotPersona } from '@tests/dot-persona.mock';
import { of as observableOf, throwError as observableThrowError } from 'rxjs';
import { DotCreatePersonaFormComponent } from '@components/dot-add-persona-dialog/dot-create-persona-form/dot-create-persona-form.component';
import { NgControl } from '@angular/forms';
import { FileUploadModule } from 'primeng/primeng';
import { SiteServiceMock } from '@tests/site-service.mock';
import { mockResponseView } from '@tests/response-view.mock';

@Component({
    selector: 'dot-field-validation-message',
    template: ''
})
class TestFieldValidationMessageComponent {
    @Input() field: NgControl;
    @Input() message: string;
}

@Component({
    selector: 'dot-site-selector',
    template: ''
})
class MockSiteSelectorComponent {
    @Input() archive = false;
    @Input() id = '';
    @Input() live = true;
    @Input() system = true;
}

describe('DotAddPersonaDialogComponent', () => {
    let component: DotAddPersonaDialogComponent;
    let fixture: ComponentFixture<DotAddPersonaDialogComponent>;
    let dotDialog: DebugElement;
    const messageServiceMock = new MockDotMessageService({
        'modes.persona.add.persona': 'Add Persona',
        'dot.common.dialog.accept': 'Accept',
        'dot.common.dialog.reject': 'Cancel'
    });

    beforeEach(() => {
        const siteServiceMock = new SiteServiceMock();

        DOTTestBed.configureTestingModule({
            declarations: [
                DotAddPersonaDialogComponent,
                DotCreatePersonaFormComponent,
                TestFieldValidationMessageComponent,
                MockSiteSelectorComponent
            ],
            imports: [BrowserAnimationsModule, DotDialogModule, FileUploadModule],
            providers: [
                DotWorkflowActionsFireService,
                DotHttpErrorManagerService,
                { provide: DotMessageService, useValue: messageServiceMock },
                { provide: LoginService, useClass: LoginServiceMock },
                { provide: SiteService, useValue: siteServiceMock }
            ]
        });

        fixture = TestBed.createComponent(DotAddPersonaDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        dotDialog = fixture.debugElement.query(By.css('dot-dialog'));
    });

    it('should not be visible by default', () => {
        expect(dotDialog).toBeNull();
    });

    describe('visible Dialog', () => {
        beforeEach(() => {
            component.visible = true;
            fixture.detectChanges();
            dotDialog = fixture.debugElement.query(By.css('dot-dialog'));
        });

        it('should set dialog attributes correctly', () => {
            expect(dotDialog.componentInstance.header).toEqual('Add Persona');
            expect(dotDialog.componentInstance.actions).toEqual({
                accept: {
                    label: 'Accept',
                    disabled: true,
                    action: jasmine.any(Function)
                },
                cancel: {
                    label: 'Cancel',
                    action: jasmine.any(Function)
                }
            });
        });

        it('should handle disable state of the accept button when form value change', () => {
            spyOn(component, 'handlerFormValidState');
            component.personaForm.isValid.emit(true);

            expect(component.handlerFormValidState).toHaveBeenCalledWith(true);
        });

        it('should reset persona form, disable accept button and set visible to false on closeDialog', () => {
            spyOn(component.personaForm, 'resetForm');
            component.closeDialog();

            expect(component.personaForm.resetForm).toHaveBeenCalled();
            expect(component.visible).toBe(false);
            expect(component.dialogActions.accept.disabled).toBe(true);
        });

        it('should call closeDialog on dotDialog hide', () => {
            spyOn(component, 'closeDialog');
            dotDialog.componentInstance.hide.emit();
            expect(component.closeDialog).toHaveBeenCalled();
        });

        describe('call to dotWorkflowActionsFireService endpoint', () => {
            let dotHttpErrorManagerService: DotHttpErrorManagerService;
            let de: DebugElement;

            beforeEach(() => {
                de = fixture.debugElement;
                dotHttpErrorManagerService = de.injector.get(DotHttpErrorManagerService);
                spyOn(component.createdPersona, 'emit');
                spyOnProperty(component.personaForm.form, 'valid').and.returnValue(true);
            });

            it('should emit the new persona and close dialog if form is valid', () => {
                spyOn(component, 'closeDialog');
                spyOn(component.dotWorkflowActionsFireService, 'newContentlet').and.returnValue(
                    observableOf(mockDotPersona)
                );

                component.savePersona();
                expect(component.createdPersona.emit).toHaveBeenCalledWith(mockDotPersona);
                expect(component.closeDialog).toHaveBeenCalled();
            });

            it('should call dotHttpErrorManagerService if endpoint fails', () => {
                const fake500Response = mockResponseView(500);
                spyOn(dotHttpErrorManagerService, 'handle');

                spyOn(component.dotWorkflowActionsFireService, 'newContentlet').and.returnValue(
                    observableThrowError(fake500Response)
                );

                component.savePersona();
                expect(component.createdPersona.emit).not.toHaveBeenCalled();
                expect(dotHttpErrorManagerService.handle).toHaveBeenCalledWith(fake500Response);
            });
        });
    });
});