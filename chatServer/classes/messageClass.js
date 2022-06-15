class Message {
  #text;
  #userId;
  #date;
  #readDate;

  constructor(messageDoc) {
    this.#date = messageDoc?.date;
    this.#readDate = messageDoc?.readDate;
    this.#text = messageDoc?.text;
    this.#userId = messageDoc?.userId;
  }

  get text() {
    return this.#text;
  }

  get userId() {
    return this.#userId;
  }

  get date() {
    return this.#date;
  }

  get readDate() {
    return this.#readDate;
  }

  setText(load) {
    this.#text = load;
  }

  setUserId(load) {
    this.#userId = load;
  }

  setDate(load) {
    this.#date = load;
  }

  setReadDate(load) {
    this.#readDate = load;
  }
}
