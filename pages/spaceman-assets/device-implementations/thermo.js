import Device from "../device.js";
import { colors, TAU } from "../helpers/helpers.js";

/**
 * Class representing a thermometer device.
 * @extends Device
 */
export default class Thermometer extends Device {
  constructor(spaceMan, isPreviewElem = false) {
    super("THERMOMETER", spaceMan, isPreviewElem);
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
        this.illustration.IlloOffText.visible = false;
        this.illustration.line1_offset.color = colors["blue1"];
        for (let i = 0; i < 5; i++) {
          this.illustration.arcGroup.children[i].color = colors["blue1"];
        }
        for (let i = 0; i < 3; i++) {
          this.illustration.smallerLinesGroup1.children[i].color =
            colors["blue1"];
          this.illustration.smallerLinesGroup2.children[i].color =
            colors["blue1"];
          this.illustration.smallerLinesGroup3.children[i].color =
            colors["blue1"];
          this.illustration.smallerLinesGroup4.children[i].color =
            colors["blue1"];
        }
        return this.show();
      case "ON":
        this.illustration.IlloOffText.value = newTempValue.toString() + "°";
        this.illustration.IlloOffText.visible = true;
        this.illustration.IlloOffText.color = "white";
        this.illustration.line1_offset.color = colors["yellow"];
        for (let i = 0; i < 5; i++) {
          this.illustration.arcGroup.children[i].color = colors["yellow"];
        }
        for (let i = 0; i < 3; i++) {
          this.illustration.smallerLinesGroup1.children[i].color =
            colors["yellow"];
          this.illustration.smallerLinesGroup2.children[i].color =
            colors["yellow"];
          this.illustration.smallerLinesGroup3.children[i].color =
            colors["yellow"];
          this.illustration.smallerLinesGroup4.children[i].color =
            colors["yellow"];
        }
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
      zoom: isPreviewElem ? 25 : 15,
      rotate: { x: -0.3, y: 0.6 },
    });
    this.illustration.base = new Zdog.Cylinder({
      addTo: this.illustration.zdogillo,
      diameter: 6,
      length: 2,
      stroke: false,
      color: colors["blue1"],
      frontFace: colors["blue2"],
      backface: colors["blue0"],
      fill: true,
    });
    this.illustration.screen = new Zdog.Ellipse({
      addTo: this.illustration.base,
      diameter: 4.5,
      stroke: 0.5,
      fill: true,
      color: colors["blue0"],
      translate: { z: 1.25 },
    });
    this.illustration.arcGroup = new Zdog.Group({
      addTo: this.illustration.screen,
      translate: { z: 0.25 },
    });
    this.illustration.line1 = new Zdog.Shape({
      addTo: this.illustration.arcGroup,
      color: colors["blue1"],
      stroke: 0.25,
      path: [{ y: -2 }, { y: -1.5 }],
    });
    this.illustration.line1.copy({
      rotate: { z: TAU / 3 },
    });
    this.illustration.line1.copy({
      rotate: { z: TAU / 6 },
    });
    this.illustration.line1.copy({
      rotate: { z: -TAU / 3 },
    });
    this.illustration.line1.copy({
      rotate: { z: -TAU / 6 },
    });
    this.illustration.smallerLinesGroup1 = new Zdog.Group({
      addTo: this.illustration.arcGroup,
    });
    this.illustration.smallLine1 = new Zdog.Shape({
      addTo: this.illustration.smallerLinesGroup1,
      color: colors["blue1"],
      stroke: 0.125,
      path: [{ y: -2 }, { y: -1.75 }],
      rotate: { z: TAU / 24 },
    });
    this.illustration.smallLine1.copy({
      rotate: { z: TAU / 12 },
    });
    this.illustration.smallLine1.copy({
      rotate: { z: (3 * TAU) / 24 },
    });
    this.illustration.smallerLinesGroup2 =
      this.illustration.smallerLinesGroup1.copyGraph({
        rotate: {
          z: TAU / 6,
        },
      });
    this.illustration.smallerLinesGroup3 =
      this.illustration.smallerLinesGroup1.copyGraph({
        rotate: {
          z: -TAU / 6,
        },
      });
    this.illustration.smallerLinesGroup4 =
      this.illustration.smallerLinesGroup1.copyGraph({
        rotate: {
          z: -TAU / 3,
        },
      });
    // fixes z-fighting
    // https://zzz.dog/extras#z-fighting
    this.illustration.line1_offset = new Zdog.Ellipse({
      addTo: this.illustration.arcGroup,
      color: colors["blue1"],
      stroke: 0.2,
      diameter: 0.5,
      translate: { y: 1.25 },
    });
    this.illustration.screenReflection = new Zdog.Ellipse({
      addTo: this.illustration.screen,
      color: colors["blue3"],
      stroke: 0.2,
      diameter: 4.75,
      quarters: 1,
    });
    this.illustration.baseReflectionGroup = new Zdog.Group({
      addTo: this.illustration.base,
    });
    this.illustration.baseReflection = new Zdog.Shape({
      addTo: this.illustration.baseReflectionGroup,
      color: "white",
      stroke: 0.25,
      path: [
        { y: -2.85, z: 0.75 },
        { y: -2.85, z: -0.75 },
      ],
      rotate: { z: TAU / 12 },
    });
    // Offset to fix the z-fighting on the reflection
    this.illustration.baseReflectionOffset = new Zdog.Shape({
      addTo: this.illustration.baseReflectionGroup,
      translate: { x: 2.4, y: -3.25, z: -2.1 },
      color: "white",
      visible: false,
    });

    // Set up a font to use
    this.illustration.font = new Zdog.Font({
      src: "../spaceman-assets/fonts/Poppins-Light.ttf",
    });

    this.illustration.IlloOffText = new Zdog.Text({
      addTo: this.illustration.arcGroup,
      font: this.illustration.font,
      value: "73",
      fontSize: 1,
      fill: true,
      textAlign: "center",
      stroke: 0.01,
      color: colors["blue0"],
      translate: { y: 0.5 },
      visible: false,
    });
    return this.show();
  }
}
