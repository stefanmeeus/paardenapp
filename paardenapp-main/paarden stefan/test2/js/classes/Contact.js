export default class Contact {
  constructor({ naam = "", telefoon = "", email = "" } = {}) {
    this.naam = naam;
    this.telefoon = telefoon;
    this.email = email;
  }

  static fromJSON(obj) {
    return new Contact(obj);
  }

  toJSON() {
    return { ...this };
  }
}
