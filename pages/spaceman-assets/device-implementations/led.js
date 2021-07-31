import Device from "../device.js";
import { colors, TAU } from "../helpers/helpers.js";

/**
 * Class representing a LED bulb device.
 * @extends Device
 */
export default class LEDBulb extends Device {
  constructor(spaceMan, isPreviewElem = false) {
    super("LED", spaceMan, isPreviewElem);
  }

  /** Change the status of the device.
   * @param {string} newStatus The new status to change the device to.
   * */
  changeStatus(newStatus) {
    if (this.statuses.includes(newStatus)) {
      this.status = newStatus;
    }
    switch (newStatus) {
      case "OFF":
        this.illustration.ledTop.color = colors["red"];
        this.illustration.ledCylider.color = colors["red"];
        this.illustration.ledCylider.backface = colors["redLight"];
        this.illustration.glow.visible = false;
        return this.show();
      case "ON":
        this.illustration.ledTop.color = colors["redLight"];
        this.illustration.ledCylider.color = colors["redLight"];
        this.illustration.ledCylider.backface = colors["redLight2"];
        this.illustration.glow.visible = true;
        return this.show();
      default:
        if (!this.statuses.includes(newStatus))
          console.error(`Invalid status change for ${this.name}`);
        return this.show();
    }
  }

  /**
   * Creates and return illustration for the device.
   * This must be called after placing the device container on screen already.
   * Otherwise, the width and height of the canvas would not be set properly
   * by Zdog, and the illustration won't be rendered correctly.
   * @param {boolean} isPreviewElem Whether this instance is part of a preview
   * modal
   * */
  createIllustration(isPreviewElem) {
    // The main illustration
    this.illustration.zdogillo = new Zdog.Illustration({
      element: this.canvElem,
      resize: true,
      zoom: isPreviewElem ? 8 : 5,
      rotate: { x: 2.4, y: -0.8, z: 0 },
      translate: { x: 0, y: -1 },
    });

    this.illustration.ledCylider = new Zdog.Cylinder({
      addTo: this.illustration.zdogillo,
      color: colors["red"],
      diameter: 8,
      stroke: 0,
      length: 8,
      backface: colors["redLight"],
    });

    this.illustration.ledTop = new Zdog.Hemisphere({
      addTo: this.illustration.zdogillo,
      color: colors["red"],
      diameter: 8,
      stroke: 0,
      translate: { z: 4 },
    });

    this.illustration.pinGroup = new Zdog.Group({
      addTo: this.illustration.zdogillo,
      translate: {
        z: -8,
      },
    });

    this.illustration.pin1 = new Zdog.Cylinder({
      addTo: this.illustration.pinGroup,
      color: colors["grayDark"],
      stroke: 0,
      diameter: 1,
      length: 8,
      translate: { x: -2 },
    });

    this.illustration.pin2 = this.illustration.pin1.copy({
      translate: { x: 2 },
    });

    this.illustration.glow = new Zdog.Shape({
      addTo: this.illustration.zdogillo,
      stroke: 20,
      translate: {
        z: 2,
      },
      color: colors["redLight"] + "55",
      visible: false,
    });

    return this.show();
  }
}
