import { generateId } from "../utils.js";

export class Contact {
  constructor({
    id = generateId("contact"),
    naam = "",
    rol = "",
    telefoon = "",
    email = "",
    adres = ""
  } = {}) {
    this.id = id;
    this.naam = naam;
    this.rol = rol;
    this.telefoon = telefoon;
    this.email = email;
    this.adres = adres;
  }

  static fromJSON(obj) {
    return new Contact(obj);
  }

  toJSON() {
    return { ...this };
  }

  get displayName() {
    return `${this.naam} (${this.rol || "onbekend"})`;
  }
}
