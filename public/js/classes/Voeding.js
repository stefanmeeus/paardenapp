import { generateId } from "../utils.js";

export default class Voeding {
  constructor({
    id = generateId("voeding"),
    paardId = null, // null betekent: standaard voeding voor ALLE paarden
    ochtend = "",
    middag = "",
    avond = "",
    supplementen = {
      ochtend: "",
      middag: "",
      avond: ""
    }
  } = {}) {
    this.id = id;
    this.paardId = paardId; // null = standaard, anders specifieke paard-ID
    this.ochtend = ochtend; // vrije tekst
    this.middag = middag;   // vrije tekst
    this.avond = avond;     // vrije tekst
    this.supplementen = {   // vrije tekst per moment
      ochtend: supplementen.ochtend || "",
      middag: supplementen.middag || "",
      avond: supplementen.avond || ""
    };
  }

  static fromJSON(obj) {
    return new Voeding({
      id: obj.id,
      paardId: obj.paardId ?? null,
      ochtend: obj.ochtend ?? "",
      middag: obj.middag ?? "",
      avond: obj.avond ?? "",
      supplementen: {
        ochtend: obj.supplementen?.ochtend ?? "",
        middag: obj.supplementen?.middag ?? "",
        avond: obj.supplementen?.avond ?? ""
      }
    });
  }

  toJSON() {
    return {
      id: this.id,
      paardId: this.paardId,
      ochtend: this.ochtend,
      middag: this.middag,
      avond: this.avond,
      supplementen: {
        ochtend: this.supplementen.ochtend,
        middag: this.supplementen.middag,
        avond: this.supplementen.avond
      }
    };
  }

  isStandaard() {
    return this.paardId === null;
  }

  isVoorPaard(paardId) {
    return String(this.paardId) === String(paardId);
  }
}
