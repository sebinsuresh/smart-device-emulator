import Device from "../device.js";
import { colors, TAU } from "../helpers/helpers.js";

/**
 * Class representing a bulb device.
 * @extends Device
 */
export default class Bulb extends Device {
  constructor(spaceMan, isPreviewElem = false) {
    super("BULB", spaceMan, isPreviewElem);
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
        this.illustration.bulb.color = colors["bulbColor"];
        this.illustration.bulbHighlight.visible = true;
        this.illustration.filament.color = colors["filamentOffColor"];
        this.illustration.bulbInnerGlow.visible = false;
        this.illustration.bulbOuterGlow.visible = false;
        this.illustration.outerRays.visible = false;
        return this.show();
      case "ON":
        this.illustration.bulb.color = colors["bulbOnColor"];
        this.illustration.bulbHighlight.visible = false;
        this.illustration.filament.color = colors["filamentOnColor"];
        this.illustration.bulbInnerGlow.visible = true;
        this.illustration.bulbOuterGlow.visible = true;
        this.illustration.outerRays.visible = true;
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
    this.illustration.zdogillo = new Zdog.Illustration({
      element: this.canvElem,
      resize: true,
      rotate: { x: -0.4 + TAU / 4, y: 0.3 },
      translate: { x: 1, y: 3 },
      zoom: isPreviewElem ? 15 : 10,
    });
    this.illustration.baseStart = new Zdog.Ellipse({
      addTo: this.illustration.zdogillo,
      diameter: 2,
      stroke: 1,
      color: colors["bulbBaseColor"],
      fill: true,
    });
    this.illustration.base2 = this.illustration.baseStart.copy({
      addTo: this.illustration.baseStart,
      translate: { z: 1 },
    });
    this.illustration.base3 = this.illustration.base2.copy({
      addTo: this.illustration.base2,
      translate: { z: 1 },
    });
    this.illustration.baseBottom = new Zdog.Hemisphere({
      addTo: this.illustration.baseStart,
      diameter: 2,
      stroke: false,
      color: colors["baseBottomColor"],
      translate: {
        z: -0.5,
      },
      rotate: {
        y: TAU / 2,
      },
    });
    this.illustration.bulb = new Zdog.Shape({
      addTo: this.illustration.base3,
      stroke: 6,
      translate: {
        z: 3,
      },
      color: colors["bulbColor"],
    });
    this.illustration.bulbHighlight = new Zdog.Ellipse({
      addTo: this.illustration.bulb,
      // color: colors["bulbHighlightColor"],
      color: "rgba(0,0,0,0)",
      stroke: 0.1,
      height: 2,
      backface: colors["bulbHighlightColor"],
      width: 1,
      fill: true,
      translate: { x: 1.5, y: 1.5, z: 2 },
      rotate: { x: TAU / 2.5, y: TAU / 11, z: 0 },
    });
    this.illustration.filament = new Zdog.Shape({
      addTo: this.illustration.base3,
      stroke: 0.2,
      color: colors["filamentOffColor"],
      path: [
        // start
        { x: 0.2, z: 0.5 },
        // 1
        {
          arc: [
            { x: 0.2, z: 1 },
            { x: 1, z: 2 },
          ],
        },
        // 2
        {
          arc: [
            { x: 1.5, z: 2.5 },
            { x: 0.75, z: 2.5 },
          ],
        },
        // 3
        {
          arc: [
            { x: 0.25, z: 2.5 },
            { x: 0.5, z: 2 },
          ],
        },
        // 4
        {
          arc: [
            { x: 1, z: 2 },
            { x: 0.75, z: 2.5 },
          ],
        },
        // 5
        {
          arc: [
            { x: 0.25, z: 3 },
            { x: 0, z: 2.5 },
          ],
        },
        // 6
        {
          arc: [
            { x: -0.35, z: 2.125 },
            { x: 0, z: 1.75 },
          ],
        },
        // 7 - mirror of 6
        {
          arc: [
            { x: 0.35, z: 2.125 },
            { x: 0, z: 2.5 },
          ],
        },
        // 8 - mirror of 5
        {
          arc: [
            { x: -0.25, z: 3 },
            { x: -0.75, z: 2.5 },
          ],
        },
        // 9 - mirror of 4
        {
          arc: [
            { x: -1, z: 2 },
            { x: -0.5, z: 2 },
          ],
        },
        // 10 - mirror of 3
        {
          arc: [
            { x: -0.25, z: 2.5 },
            { x: -0.75, z: 2.5 },
          ],
        },
        // 11 - mirror of 2
        {
          arc: [
            { x: -1.5, z: 2.5 },
            { x: -1, z: 2 },
          ],
        },
        // 12 - mirror of 1
        {
          arc: [
            { x: -0.2, z: 1 },
            { x: -0.2, z: 0.5 },
          ],
        },
      ],
      closed: false,
    });
    this.illustration.bulbInnerGlow = new Zdog.Shape({
      addTo: this.illustration.bulb,
      stroke: 4,
      color: colors["innerGlowColor"],
      visible: false,
    });
    this.illustration.bulbOuterGlow = new Zdog.Shape({
      addTo: this.illustration.bulb,
      stroke: 8,
      color: colors["outerGlowColor"],
      visible: false,
    });
    this.illustration.outerRays = new Zdog.Group({
      addTo: this.illustration.bulb,
      visible: false,
    });
    this.illustration.ray1 = new Zdog.Shape({
      addTo: this.illustration.outerRays,
      stroke: 0.5,
      path: [{ x: 5 }, { x: 7 }],
      color: colors["rayColor"],
    });
    this.illustration.ray1.copy({
      rotate: { y: TAU / 6 },
    });
    this.illustration.ray1.copy({
      rotate: { y: TAU / 3 },
    });
    this.illustration.ray1.copy({
      rotate: { y: TAU / 2 },
    });
    this.illustration.ray1.copy({
      rotate: { y: (2 * TAU) / 3 },
    });
    this.illustration.ray1.copy({
      rotate: { y: (5 * TAU) / 6 },
    });

    return this.show();
  }
}
