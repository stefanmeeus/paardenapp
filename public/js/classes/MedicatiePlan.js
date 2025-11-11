import { generateId } from "../utils.js";

export class MedicatiePlan {
  constructor({
    id = generateId("medicatie"),
    paardId = "",
    naam = "",
    startDatum = "",
    eindDatum = "",
    dosering = "",
    instructies = "",
    herhaling = false
  } = {}) {
    this.id = id;
    this.paardId = paardId;
    this.naam = naam;
    this.startDatum = startDatum;
    this.eindDatum = eindDatum;
    this.dosering = dosering;
    this.instructies = instructies;
    this.herhaling = herhaling;
  }

  static fromJSON(obj) {
    return new MedicatiePlan({
      ...obj,
      herhaling: !!obj.herhaling
    });
  }

  toJSON() {
    return { ...this };
  }

  get displayName() {
    return `${this.naam || "Onbekende medicatie"} (${this.startDatum || "?"} → ${this.eindDatum || "?"})`;
  }
}
