import Device from "../device.js";
import { colors, TAU } from "../helpers/helpers.js";
import SpaceManager from "../spaceManager.js";

/**
 * Class Representing a Raspberry Pi Device.
 * This device can connect other devices to it.
 * @extends {Device}
 */
export default class RPi extends Device {
  constructor(spaceMan, isPreviewElem = false) {
    super("RPI", spaceMan, isPreviewElem);

    this.statuses = ["ON"];
    this.status = "ON";

    /**
     * Array of { pinNumber, deviceId } for other devices connected to the RPi.
     * @type [{pinNumber:number, deviceId:string}]
     */
    this.connectedDevices = [];
  }

  /**
   * Add the specified device to the list of connected devices of this RPi.
   * Note that this only updates the connectedDevices array of the RPi device.
   * The other device's properties must be updated separately.
   * @param {string} idToConnect The ID of the device connecting to the RPi
   * @param {number} pinum The pin to connect the other device to
   */
  addConnectedDevice(idToConnect, pinNum = -1) {
    // Find the correct pinNum
    // If pinNum was not specified in method call, find first available pinNum.
    if (pinNum === -1) {
      // Pin numbers start at 1, not 0.
      pinNum = 1;
      while (this.connectedDevices.find((dev) => dev.pinNumber == pinNum))
        pinNum++;
    }

    this.connectedDevices.push({ pinNumber: pinNum, deviceId: idToConnect });
  }

  /**
   * Change the status of the device.
   * @param {string} newStatus The new status to change the device to.
   * */
  changeStatus(newStatus) {
    if (this.statuses.includes(newStatus)) {
      this.status = newStatus;
    }
    switch (newStatus) {
      case "ON":
        return this.show();
      default:
        if (!this.statuses.includes(newStatus))
          console.error(`Invalid status change for ${this.name}`);
        return this.show();
    }
  }

  /**
   * Creates the canvas element placed inside the draggable device div
   * OVERRIDE for RPi: To make the width 200px.
   * @returns {HTMLDivElement}
   */
  createCanvElem() {
    const canvElem = document.createElement("canvas");
    canvElem.classList.add("deviceCanv");
    canvElem.style.width = "200px";

    return canvElem;
  }

  /**
   * Delete this device :
   * Removes any listeners, HTML elements, and any connections with other
   * devices.
   */
  delete() {
    // Call the delete function for Device class (superclass)
    super.delete();

    // Remove any connection this RPi has with other devices.
    if (this.connectedDevices.length > 0) {
      this.connectedDevices.forEach((connDevPinId) => {
        const connDevObj = this.spaceMan.devices.find(
          (dev) => dev.id === connDevPinId.deviceId
        );
        connDevObj.isConnected = false;
        connDevObj.connectedTo = null;
      });
    }
  }

  /**
   * Check whether a device exists at specified pin number or not.
   * @param {string} pinNum Pin number of this RPi to check for any devices
   * @returns {boolean} Existence of device at specified pin of this RPi
   */
  deviceAtPinAlready(pinNum) {
    return !!this.connectedDevices.find((dev) => dev.pinNumber === pinNum);
  }

  /**
   * Remove the connected device from this RPi. Note that this only updates the
   * connectedDevices array of this RPi. The other device's properties must be
   * separately updated.
   * @param {string} idToRemove The ID of the device being removed from RPi's
   * connections.
   */
  removeConnectedDevice(idToRemove) {
    this.connectedDevices.splice(
      this.connectedDevices.findIndex((dev) => dev.deviceId === idToRemove),
      1
    );
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
      zoom: isPreviewElem ? 3 : 2.75,
      translate: isPreviewElem ? {} : { y: 2.5 },
      rotate: { x: 0.9, y: 0, z: -0.5 },
    });

    // The Group of elements that make up the PCB:
    // The PCB itself and a counter balance point to prevent z-fighting.
    this.illustration.pcbGroup = new Zdog.Group({
      addTo: this.illustration.zdogillo,
      updateSort: true,
    });

    // The PCB board (simpole green rectangle)
    this.illustration.pcb = new Zdog.Box({
      addTo: this.illustration.pcbGroup,
      width: 60,
      height: 30,
      depth: 2,
      fill: true,
      color: colors["green"],
      leftFace: colors["greenDark"],
      bottomFace: colors["greenDark"],
      translate: { z: -1 },
    });

    // The counter balance for the PCB to prevent z-fighting
    this.illustration.pcbBalance = new Zdog.Shape({
      addTo: this.illustration.pcbGroup,
      visible: false,
      translate: { z: -250 },
    });

    // The big silver ports - 2x USB, ethernet
    this.illustration.bigPorts = new Zdog.Group({
      addTo: this.illustration.zdogillo,
      translate: { z: 3 },
    });

    // The first port among the three
    this.illustration.firstPort = new Zdog.Box({
      addTo: this.illustration.bigPorts,
      width: 7,
      height: 7,
      depth: 7,

      rearFace: colors["grayDark"],
      leftFace: colors["gray"],
      rightFace: false,
      topFace: false,
      bottomFace: colors["gray"],

      rotate: { x: TAU / 4 },
      translate: { x: 26, y: -11 },
    });

    // second port - moved down
    this.illustration.secondPort = this.illustration.firstPort.copy({
      translate: { x: 26, y: -1 },
    });

    // third port - moved further down
    this.illustration.thirdPort = this.illustration.firstPort.copy({
      translate: { x: 26, y: 9 },
    });

    // A "shadow" added to the bottom of the three ports
    this.illustration.portsBottom = new Zdog.Rect({
      addTo: this.illustration.zdogillo,
      width: 10,
      height: 31,
      depth: 1,
      stroke: 0,
      color: colors["greenDark"],
      fill: true,
      translate: {
        x: 25,
        y: 0,
        z: 0.5,
      },
    });

    // The 40 pins on the board.
    // This Group will contain all of them.
    this.illustration.ioPorts = new Zdog.Group({
      addTo: this.illustration.zdogillo,
      translate: {
        y: -12,
        z: 3,
      },
      updateSort: true,
    });

    // The first pin base is created manually.
    this.illustration.firstPin = new Zdog.Box({
      addTo: this.illustration.ioPorts,
      width: 1,
      height: 5,
      depth: 4,
      color: colors["dark"],
      translate: {
        x: -28,
      },
      frontFace: colors["dark2"],
    });

    // The first pin for the first two io pins is added.
    this.illustration.firstPinsPin = new Zdog.Cylinder({
      addTo: this.illustration.firstPin,
      diameter: 0.75,
      stroke: 0,
      length: 3,
      color: colors["yellowPi"],
      translate: {
        y: -1.5,
        z: 4.25,
      },
    });

    // The first pin is cloned and moved down for the second pin.
    this.illustration.firstPinsPin2 = this.illustration.firstPinsPin.copy({
      translate: {
        y: 1.5,
        z: 4.25,
      },
    });

    // An array that contains all the pins.
    // The first two pins & their base are added manually to the array.
    this.illustration.allPins = [this.illustration.firstPin];

    // The remaining 38 pins are added using a loop, by cloning the
    // previous elements.
    for (let i = 1; i < 20; i++) {
      this.illustration.allPins[i] = this.illustration.allPins[i - 1].copyGraph(
        {
          translate: {
            x: this.illustration.allPins[i - 1].translate.x + 2.5,
          },
        }
      );
    }

    // A "shadow" for the io pins region.
    this.illustration.pinsBottom = new Zdog.Rect({
      addTo: this.illustration.zdogillo,
      width: 50.5,
      height: 7,
      depth: 1,
      stroke: 0,
      color: colors["greenDark"],
      fill: true,
      translate: {
        x: -4.25,
        y: -11.75,
        z: 0.5,
      },
    });

    // The dark base for the CPU chip
    this.illustration.cpuBase = new Zdog.Rect({
      addTo: this.illustration.zdogillo,
      width: 12,
      height: 12,
      stroke: 0,
      color: colors["dark"],
      fill: true,
      translate: {
        x: -7,
      },
    });

    // The CPU chip itself
    this.illustration.cpuChip = new Zdog.Box({
      addTo: this.illustration.zdogillo,
      width: 10,
      height: 10,
      depth: 0.25,
      stroke: 0.75,
      color: colors["grayDark"],
      frontFace: colors["gray"],
      translate: {
        x: -7,
        z: 0.5,
      },
    });

    // The other chip next to CPU.
    this.illustration.chip2 = new Zdog.Box({
      addTo: this.illustration.zdogillo,
      width: 10,
      height: 8,
      depth: 0.25,
      stroke: 0.75,
      color: colors["dark2"],
      frontFace: colors["dark"],
      translate: {
        x: 10,
        z: 0.5,
      },
    });

    // The pins on left side of chip 2 are put in a group.
    // Later, this group is duplicated & flipped to the other
    // side.
    this.illustration.chip2PinsGroup = new Zdog.Group({
      addTo: this.illustration.chip2,
    });

    // The first pin among the left side pins of chip 2.
    this.illustration.chip2Pin1 = new Zdog.Ellipse({
      addTo: this.illustration.chip2PinsGroup,
      width: 2,
      height: 0.5,
      stroke: 1,
      quarters: 1,
      color: colors["grayDark"],
      translate: {
        x: -5.5,
        y: -3,
        z: 0,
      },
      rotate: {
        x: -TAU / 4,
        y: -TAU / 2,
      },
    });

    // second pin
    this.illustration.chip2Pin2 = this.illustration.chip2Pin1.copy({
      translate: {
        x: -5.5,
        y: 0,
        z: 0,
      },
    });

    // third pin
    this.illustration.chip2Pin3 = this.illustration.chip2Pin1.copy({
      translate: {
        x: -5.5,
        y: 3,
        z: 0,
      },
    });

    // Duplicate the pins for chip2 on left side to the right side,
    // and flip it to the other side.
    this.illustration.chip2PinsGroup2 =
      this.illustration.chip2PinsGroup.copyGraph({
        rotate: {
          z: TAU / 2,
        },
      });

    // Group to contain the shadow for chip 2
    this.illustration.chip2ShadowGroup = new Zdog.Group({
      addTo: this.illustration.zdogillo,
    });

    // The shadow for chip2
    this.illustration.chip2Shadow = new Zdog.Rect({
      addTo: this.illustration.chip2ShadowGroup,
      width: 13.5,
      height: 8,
      stroke: 1,
      color: colors["greenDark"],
      fill: true,
      translate: {
        x: 10,
        z: -0.5,
      },
    });

    // hidden element to counter z-fighting for chip2's base shadow.
    this.illustration.chip2Base_balance = new Zdog.Shape({
      addTo: this.illustration.chip2ShadowGroup,
      visible: false,
      translate: {
        x: 10,
        z: -10,
      },
    });

    // Micro USB port in the front-left of the device.
    this.illustration.microUsb = new Zdog.Box({
      addTo: this.illustration.zdogillo,
      width: 5,
      height: 5,
      depth: 2,
      stroke: 0.1,
      color: colors["grayDark"],
      frontFace: colors["gray"],
      translate: {
        x: -20,
        y: 12,
        z: 1,
      },
    });

    // The hole for the micro USB port.
    this.illustration.microUsbHole = new Zdog.Rect({
      addTo: this.illustration.microUsb,
      color: colors["dark"],
      width: 4,
      stroke: 0,
      fill: true,
      height: 1.5,
      translate: {
        y: 2.6,
        z: 0,
      },
      rotate: {
        x: TAU / 4,
      },
    });

    // Shadow for the micro USB port.
    this.illustration.microUsbShadow = new Zdog.Rect({
      addTo: this.illustration.microUsb,
      width: 6,
      height: 6,
      stroke: 1,
      color: colors["greenDark"],
      fill: true,
      translate: {
        x: 0,
        z: -0.5,
      },
    });

    // HDMI port on the device.
    this.illustration.hdmi = new Zdog.Box({
      addTo: this.illustration.zdogillo,
      width: 7,
      height: 5,
      depth: 2,
      stroke: 0.1,
      color: colors["grayDark"],
      frontFace: colors["gray"],
      translate: {
        x: -5,
        y: 12,
        z: 1,
      },
    });

    // Shadow for the HDMI port.
    this.illustration.hdmibHole = new Zdog.Rect({
      addTo: this.illustration.hdmi,
      color: colors["dark"],
      width: 6.5,
      stroke: 0,
      height: 1.5,
      fill: true,
      translate: {
        y: 2.6,
        z: 0,
      },
      rotate: {
        x: TAU / 4,
      },
    });

    // Shadow for the HDMI port.
    this.illustration.hdmiShadow = new Zdog.Rect({
      addTo: this.illustration.hdmi,
      width: 8,
      height: 6,
      stroke: 1,
      color: colors["greenDark"],
      fill: true,
      translate: {
        x: 0,
        z: -0.5,
      },
    });

    // The Raspberry Pi Logo (not exact) is created using a bunch of ellipses
    // arranged within this group.
    this.illustration.rpiLogoGroup = new Zdog.Group({
      addTo: this.illustration.zdogillo,
      translate: {
        x: -20,
        y: -2,
        z: 0,
      },
    });

    this.illustration.circle1 = new Zdog.Ellipse({
      addTo: this.illustration.rpiLogoGroup,
      width: 2,
      height: 3,
      stroke: 0.5,
      color: colors["yellowPi"],
      rotate: {
        z: -TAU / 8,
      },
    });

    this.illustration.circle2 = this.illustration.circle1.copy({
      width: 2,
      translate: {
        x: -2.5,
      },
      rotate: {
        z: TAU / 8,
      },
    });

    this.illustration.circle3 = new Zdog.Ellipse({
      addTo: this.illustration.rpiLogoGroup,
      width: 2.5,
      height: 3,
      stroke: 0.5,
      color: colors["yellowPi"],
      translate: {
        x: -1.25,
        y: 2,
      },
    });

    this.illustration.circle4 = this.illustration.circle3.copy({
      width: 2,
      translate: {
        x: -3.5,
        y: 2.75,
      },
    });

    this.illustration.circle5 = this.illustration.circle4.copy({
      translate: {
        x: 1,
        y: 2.75,
      },
    });

    this.illustration.circle6 = this.illustration.circle3.copy({
      height: 2.5,
      width: 3,
      translate: {
        x: -1.25,
        y: 4.6,
      },
    });

    this.illustration.leaf1 = new Zdog.Ellipse({
      addTo: this.illustration.rpiLogoGroup,
      width: 1.5,
      height: 3,
      stroke: 0.5,
      color: colors["yellowPi"],
      translate: {
        x: -2.5,
        y: -2.25,
      },
      rotate: {
        z: -TAU / 6,
      },
    });

    this.illustration.life2 = this.illustration.leaf1.copy({
      translate: {
        x: 0,
        y: -2.25,
      },
      rotate: {
        z: TAU / 6,
      },
    });

    return this.show();
  }
}
