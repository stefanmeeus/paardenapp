import { generateId } from "../utils.js";

export class Stal {
  constructor({
    id = generateId("stal"),
    naam = "",
    locatie = "",
    capaciteit = "",
    bezetting = "",
    opmerkingen = ""
  } = {}) {
    this.id = id;
    this.naam = naam;
    this.locatie = locatie;
    this.capaciteit = capaciteit;
    this.bezetting = bezetting;
    this.opmerkingen = opmerkingen;
  }

  static fromJSON(obj) {
    return new Stal(obj);
  }

  toJSON() {
    return { ...this };
  }

  get vrijePlaatsen() {
    return this.capaciteit - this.bezetting;
  }
}
