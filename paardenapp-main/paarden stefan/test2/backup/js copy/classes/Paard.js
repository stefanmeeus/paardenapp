import { generateId } from "../utils.js";

export class Paard {
  constructor({
    id = generateId("paard"),
    naam = "",
    leeftijd = "",
    ras = "",
    stal = "",
    voeding = "",
    training = "",
    opmerkingen = ""
  } = {}) {
    this.id = id;
    this.naam = naam;
    this.leeftijd = leeftijd;
    this.ras = ras;
    this.stal = stal;
    this.voeding = voeding;
    this.training = training;
    this.opmerkingen = opmerkingen;
  }

  static fromJSON(obj) {
    return new Paard(obj);
  }

  toJSON() {
    return { ...this };
  }

  get displayName() {
    return `${this.naam || "Onbekend paard"} (${this.ras || "ras onbekend"})`;
  }
}
