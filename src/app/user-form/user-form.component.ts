import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from "@angular/forms";
import 'rxjs/add/operator/debounceTime';


function passwordMatcher(c: AbstractControl): { [key: string]: boolean } | null {
  let passwordControl = c.get('password');
  let confirmPasswordControl = c.get('cPassword');
  if (passwordControl.pristine || confirmPasswordControl.pristine)
    return null;
  if (passwordControl.value === confirmPasswordControl.value)
    return null;
  return { 'matchPasswords': true };
}

@Component({
  selector: 'user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {

  passwordMessages = {
    required: "Required!",
    nameL: "Name must be at least 3 characters long!",
    surnameL: "Last name may not exceed 50 characters!",
    email: "Please enter a valid email address!",
    phone: "Phone number should be in following format: +99(99)9999-9999)",
    userEx: "This user already exists!",
    matchPasswords:"Passwords don't match!",
    pattern: "Password is invalid. Must contain UpperCase, LowerCase and Number.",
    token: "Token invalid!"
  };

  matchPasswordsMsg;
  passwordPatternMsg;
  requiredMsg = this.passwordMessages['required'];
  nameLengthMsg = this.passwordMessages['nameL'];
  surnameLengthMsg = this.passwordMessages['surnameL'];
  emailMsg = this.passwordMessages['email'];
  phoneMsg = this.passwordMessages['phone'];
  tokenMessage = this.passwordMessages['token'];
  userExistsMsg = this.passwordMessages['userEx'];

  userForm: FormGroup;
  userExists = false;
  phoneRequired = false;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {

    this.userForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      sms: ['no', ],
      phone: ['', [Validators.pattern(/[\+]\d{2}[\(]\d{2}[\)]\d{4}[\-]\d{4}/)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      token: ['', [ Validators.pattern(/^abc123$/)]],
      pswdGroup: this.formBuilder.group({
        password: ['', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/)]],
        cPassword: ['', [Validators.required]]
      }, {
        validator: passwordMatcher
      })
    });

    this.userForm.get('username').valueChanges.debounceTime(1000).subscribe(value => {
      if (value === 'admin')
        this.userExists = true;
      else this.userExists = false;
    });

    this.userForm.get('sms').valueChanges.subscribe(value => {
      const phoneField = this.userForm.controls['phone'];
      const tokenField = this.userForm.controls['token'];
      if (value === 'yes') {
        this.phoneRequired = true;
        phoneField.setValidators(Validators.compose([Validators.required, Validators.pattern(/[\+]\d{2}[\(]\d{2}[\)]\d{4}[\-]\d{4}/)]));
        phoneField.updateValueAndValidity();
        tokenField.setValidators(Validators.compose([Validators.required, Validators.pattern(/^abc123$/)]));
        tokenField.updateValueAndValidity();
      }
      else if (value === 'no') {
        this.phoneRequired = false;
        phoneField.setValidators(Validators.compose([Validators.pattern(/[\+]\d{2}[\(]\d{2}[\)]\d{4}[\-]\d{4}/)]));
        phoneField.updateValueAndValidity();
        tokenField.setValidators(Validators.compose([ Validators.pattern(/^abc123$/)]));
        tokenField.updateValueAndValidity();
      }
    });

    let passwordGroup = this.userForm.get("pswdGroup");
    let password = this.userForm.get("pswdGroup.password");

    password.valueChanges.debounceTime(500).subscribe(value => {
      this.passwordPatternMsg = '';
        if ((password.touched || password.dirty) && password.getError('pattern')){
          this.passwordPatternMsg = this.passwordMessages['pattern'];
        }
    });

    let confirmPassword = this.userForm.get("pswdGroup.cPassword");

    confirmPassword.valueChanges.debounceTime(500).subscribe(value => {
      this.matchPasswordsMsg = '';

      if ((confirmPassword.touched || confirmPassword.dirty) && passwordGroup.getError('matchPasswords')) {
        this.matchPasswordsMsg = this.passwordMessages['matchPasswords'];
      }
    });

  }

  populateTestData() {
    this.userForm.patchValue({
      email: 'jkowal@wp.pl',
      username: 'jkowal'
    });
  }


}
