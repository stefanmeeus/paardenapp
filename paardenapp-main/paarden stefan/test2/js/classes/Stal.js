// js/classes/Stal.js
import { generateId } from "../utils.js";

export class Stal {
  constructor({
    id = generateId("stal"),
    stalnr = 0,
    locatienaam = "",
    paardId = null // ID van paard dat in deze stal staat
  } = {}) {
    this.id = id;
    this.stalnr = stalnr;
    this.locatienaam = locatienaam;
    this.paardId = paardId;
  }

  static fromJSON(obj) {
    return new Stal(obj);
  }

  toJSON() {
    return { ...this };
  }
}
