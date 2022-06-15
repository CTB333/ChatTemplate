class User {
  #userName;
  #password;
  #rooms;

  constructor(userDoc) {
    this.#password = userDoc?.password;
    this.#rooms = userDoc?.rooms;
    this.#userName = userDoc?.userName;
  }

  get userName() {
    return this.#userName;
  }

  get password() {
    return this.#password;
  }

  get rooms() {
    return this.#rooms;
  }
}
