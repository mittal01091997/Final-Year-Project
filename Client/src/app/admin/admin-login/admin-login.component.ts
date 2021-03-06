import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AdminService } from '../admin.service';
import { SharedService } from '@app/shared/shared.service';

@Component({
  selector: 'fyp-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {

  subscription: Subscription;
  adminLoginForm: FormGroup;
  isLoginFailure = 0;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.adminLoginForm = new FormGroup({
      'password': new FormControl('', [
        Validators.required,
        this.containsNoSpaceValidator
      ])
    });
  }

  onSubmit (): void {
    this.subscription = this.adminService.loginAdmin(this.adminLoginForm.controls['password'].value).subscribe((response: HttpResponse<null>) => {
      this.sharedService.authenticate(1);
      this.router.navigate(['/admin']);
    }, (error: any) => {
      if (error.status === 405) {
        if (this.sharedService.isAdminAuthenticated) {
          return this.router.navigate(['/admin']);
        }
        this.isLoginFailure = 2;
        setTimeout(() => {
          this.router.navigate(['/admin']);
        }, 3000);
        // 405 logged in
      } else {
        this.isLoginFailure = 1;
        // 400 unauthorised access
      }
      this.adminLoginForm.reset();
      throw error;
    }, () => this.subscription.unsubscribe());
  }

  containsNoSpaceValidator (control: FormControl): {[s: string]: boolean} {
    const controlValue = (<string>control.value);
    if (!controlValue) {
      return null;
    }
    if (controlValue.trim().length > 0) {
      return null;
    }
    return {containsNoSpaceValidator: true};
  }
}
