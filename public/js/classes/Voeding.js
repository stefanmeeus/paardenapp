import { generateId } from "../utils.js";

export default class Voeding {
  constructor({
    id = generateId("voeding"),
    paardId = "",
    ochtend = "",
    middag = "",
    avond = "",
    medicatie = { ochtend: "", middag: "", avond: "" },
    supplementen = { ochtend: "", middag: "", avond: "" }
  } = {}) {
    this.id = id;
    this.paardId = paardId;
    this.ochtend = ochtend;
    this.middag = middag;
    this.avond = avond;
    this.medicatie = medicatie;
    this.supplementen = supplementen;
  }

  static fromJSON(obj) {
    return new Voeding(obj);
  }

  toJSON() {
    return { ...this };
  }
}
