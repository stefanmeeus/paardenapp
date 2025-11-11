import { generateId } from "../utils.js";

export class Contacten {
  constructor({
    id = generateId("contact"),
    klant_ID = generateId("klant"),
    Voornaam = "",
    Achternaam = "",
    Telefoon = "",
    Email = "",
    Straat: "",
    Huisnummer: "",
    Postcode: "",
    Gemeente: "",
    Land: "",
    rol = "",
    Paardnaam = "",
    contract = []
  } = {}) {
    this.id = id;
    this.klant_ID = klant_ID;
    this.Voornaam = Voornaam;
    this.Achternaam = Achternaam;
    this.Telefoon = Telefoon;
    this.Email = Email;
    this.Straat = this.Straat
    this.Huisnummer = this.Huisnummer
    this.Postcode = this.Postcode
    this.Gemeente = this.Gemeente
    this.Land = this.Land
    this.rol = rol;
    this.Paardnaam = Paardnaam;
    this.contract = contract;
  }

  static fromJSON(obj) {
    return new Contacten(obj);
  }

  toJSON() {
    return { ...this };
  }

  get displayName() {
    return `${this.Voornaam || "Onbekende"} ${this.Achternaam || "contactpersoon"}`;
  }
}
