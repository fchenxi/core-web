import {Component, ViewEncapsulation} from '@angular/core';
import {LoginService} from '../../../../../api/services/login-service';
import {ForgotPasswordComponent} from './forgot-password-component';
import { Router } from '@ngrx/router';
import {ResponseView} from '../../../../../api/services/response-view';

@Component({
    directives: [ForgotPasswordComponent],
    encapsulation: ViewEncapsulation.Emulated,
    moduleId: __moduleName, // REQUIRED to use relative path in styleUrls
    pipes: [],
    providers: [],
    selector: 'dot-forgot-password-container',
    styleUrls: [],
    template: `
        <dot-forgot-password-component
            [message]="message"
            (cancel)="goToLogin()"
            (recoverPassword)="recoverPassword($event)"
        ></dot-forgot-password-component>
    `,
})
export class ForgotPasswordContainer{

    private message:string = '';

    constructor( private loginService: LoginService, private router: Router) {

    }

    recoverPassword(forgotPasswordLogin:string): void {
        this.message = '';

        this.loginService.recoverPassword(forgotPasswordLogin).subscribe((resp:ResponseView) => {
            this.goToLogin();
        }, (resp:ResponseView) => {
            if (!resp.existError("a-new-password-has-been-sent-to-x")){
                this.message = resp.errorsMessages;
            }else{
                this.goToLogin();
            }
        });
    }

    goToLogin():void{
        this.router.go('/public/login');
    }
}