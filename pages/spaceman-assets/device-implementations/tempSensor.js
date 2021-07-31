import Device from "../device.js";
import { colors, TAU } from "../helpers/helpers.js";

/**
 * Class representing a temperature sensor device.
 * @extends Device
 */
export default class TempSensor extends Device {
  constructor(spaceMan, isPreviewElem = false) {
    super("TEMPSENSOR", spaceMan, isPreviewElem);
  }

  /**
   * Change the status of the device.
   * @param {string} newStatus The new status to change the device to.
   * @param {number|string} [newTempValue] The new temperature shown in the
   * device
   * */
  changeStatus(newStatus, newTempValue = 73) {
    if (this.statuses.includes(newStatus)) {
      this.status = newStatus;
    }
    switch (newStatus) {
      case "OFF":
        this.illustration.tempText.value = "--";
        this.illustration.tempText.color = colors["dark"];
        return this.show();
      case "ON":
        this.illustration.tempText.value = newTempValue.toString() + "°";
        this.illustration.tempText.color = colors["gray"];
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
      zoom: isPreviewElem ? 6 : 4,
      rotate: { x: 0.9, y: 0, z: -0.5 },
      translate: { x: 5, y: -2 },
    });

    // The chip
    this.illustration.mainChip = new Zdog.Box({
      addTo: this.illustration.zdogillo,
      color: colors["dark"],
      width: 10,
      height: 10,
      depth: 5,
      stroke: 2,
      frontFace: colors["dark2"],
    });

    this.illustration.pins = new Zdog.Group({
      addTo: this.illustration.zdogillo,
    });

    this.illustration.pin1 = new Zdog.Shape({
      addTo: this.illustration.pins,
      color: colors["yellow"],
      stroke: 1,
      translate: { x: -6, y: -4, z: 0 },
      closed: false,
      path: [
        { x: 0, y: 0, z: 0 },
        { x: -3, y: 0, z: 0 },
        { x: -6, y: -2, z: 0 },
        { x: -12, y: -2, z: 0 },
      ],
    });

    this.illustration.pin2 = this.illustration.pin1.copyGraph({
      translate: { x: -6, y: 0, z: 0 },
      path: [
        { x: 0, y: 0, z: 0 },
        { x: -12, y: 0, z: 0 },
      ],
    });

    this.illustration.pin3 = this.illustration.pin1.copyGraph({
      translate: { x: -6, y: 4, z: 0 },
      path: [
        { x: 0, y: 0, z: 0 },
        { x: -3, y: 0, z: 0 },
        { x: -6, y: 2, z: 0 },
        { x: -12, y: 2, z: 0 },
      ],
    });

    // Set up a font to use
    this.illustration.font = new Zdog.Font({
      src: "../fonts/Poppins-Light.ttf",
    });

    this.illustration.textGroup = new Zdog.Group({
      addTo: this.illustration.zdogillo,
      translate: { x: -1, y: -1, z: 3 },
    });

    this.illustration.tempText = new Zdog.Text({
      addTo: this.illustration.textGroup,
      font: this.illustration.font,
      value: "--",
      fontSize: 4,
      fill: true,
      textAlign: "center",
      color: colors["dark"],
      stroke: 0.1,
      rotate: { z: TAU / 4 },
    });

    // Offset to prevent z-fighting, and
    // show the text properly. Read here:
    // https://zzz.dog/extras#z-fighting
    this.illustration.textBalance = new Zdog.Shape({
      addTo: this.illustration.textGroup,
      translate: { z: 5 },
      visible: false,
    });

    return this.show();
  }
}
