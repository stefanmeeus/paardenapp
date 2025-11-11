import { generateId } from "../utils.js";

export class Paard {
  constructor({
    id = generateId("paard"),
    naam = "",
    leeftijd = 0,
    ras = "",
    stallocatie = "",
    stalnr = 0,
    voeding = "",
    training = false,
    trainer = "",
    eigenaar = "",
    dierenarts = "",
    hoefsmid = "",
    vaccinatieDatum = "",
    ontwormingDatum = "",
    opmerkingen = "",
    paspoort = null,
    verslagen = []
  } = {}) {
    this.id = id;
    this.naam = naam;
    this.leeftijd = leeftijd;
    this.ras = ras;
    this.stallocatie = stallocatie;
    this.stalnr = stalnr;
    this.voeding = voeding;
    this.training = training;
    this.trainer = trainer;
    this.eigenaar = eigenaar;
    this.dierenarts = dierenarts;
    this.hoefsmid = hoefsmid;
    this.vaccinatieDatum = vaccinatieDatum;
    this.ontwormingDatum = ontwormingDatum;
    this.opmerkingen = opmerkingen;
    this.paspoort = paspoort;
    this.verslagen = verslagen;
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
