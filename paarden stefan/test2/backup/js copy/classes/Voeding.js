import { generateId } from "../utils.js";

export class Voeding {
  constructor({
    id = generateId("voeding"),
    naam = "",
    type = "",
    hoeveelheid = "",
    frequentie = "",
    leverancier = ""
  } = {}) {
    this.id = id;
    this.naam = naam;
    this.type = type;
    this.hoeveelheid = hoeveelheid;
    this.frequentie = frequentie;
    this.leverancier = leverancier;
  }

  static fromJSON(obj) {
    return new Voeding(obj);
  }

  toJSON() {
    return { ...this };
  }

  get beschrijving() {
    return `${this.naam} - ${this.hoeveelheid} (${this.frequentie})`;
  }
}
