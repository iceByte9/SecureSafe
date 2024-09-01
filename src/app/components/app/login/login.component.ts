import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { HomePageComponent } from "../homepage/homepage.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule, HomePageComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: any;

  // Hardcoded user details
  private users = [
    { username: 'a', password: 'a' },
    { username: 'b', password: 'a' },
    { username: 'c', password: 'a' }
  ];

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    const { username, password } = this.loginForm.value;

    // Check if the credentials match any of the hardcoded users
    const user = this.users.find(user => user.username === username && user.password === password);

    if (user) {
      // Navigate to homepage and pass the username as a query parameter
      this.router.navigate(['/homepage'], { queryParams: { username: user.username } });
      console.log('Login successful:', this.loginForm.value);
    } else {
      // Handle login failure
      console.log('Login failed: Invalid credentials');
      // Optionally, display an error message to the user
    }
  }
}
