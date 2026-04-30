export class Slonik {
  constructor({ username, password, age, place_of_birth }) {
    this.username = username;
    this.password = password;
    this.age = age;
    this.place_of_birth = place_of_birth;
  }

  validate() {
    this.checkUsername();
    this.checkAge();
    this.checkPassword();
    this.checkPlaceOfBirth();
  }

  checkPassword() {
    const passwordInput = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).*$/;
    if (!this.password || this.password.length < 8) {
      throw new Error('Password need to have 8 or more symbols');
    } else if (!passwordInput.test(this.password)) {
      throw new Error("The password must contain at least one uppercase letter, one lowercase letter, a number and a special character.");
      err.field = "password";
      throw err;
    }
  }

  checkAge() {
    if (this.age < 0) {
      const err = new Error("The age cannot be negative");
      err.field = "age";
      throw err;
    }
  }

  checkUsername() {
    const hasLetter = /[a-zA-Z]/.test(this.username); 
    if (!this.username || !hasLetter) {
      throw new Error("The username must contain at least one letter");
        err.field = "username";
        throw err;
    }
  }

  checkPlaceOfBirth() {
    if (!this.place_of_birth || this.place_of_birth.length < 2) {
      throw new Error("The field with place of birth is required, enter at least 2 symbols");
        err.field = "place_of_birth";
        throw err;
    }
  }

  toJSON() {
    return {
      username: this.username,
      age: this.age,
      place_of_birth: this.place_of_birth
    };
  }
}

export default Slonik;