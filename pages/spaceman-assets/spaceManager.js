import RPi from "./device-implementations/rpi.js";
import LEDBulb from "./device-implementations/led.js";
import TempSensor from "./device-implementations/tempSensor.js";
import Bulb from "./device-implementations/bulb.js";
import Lamp from "./device-implementations/lamp.js";
import Thermometer from "./device-implementations/thermo.js";
import Device from "./device.js";

/**
 * Object that maps names of device types (string) to the actual classes that
 * represent those devices.
 * @type {Object.<string, Device>}
 */
const deviceClasses = {
  RPI: RPi,
  LED: LEDBulb,
  TEMPSENSOR: TempSensor,
  BULB: Bulb,
  LAMP: Lamp,
  THERMOMETER: Thermometer,
};

/**
 * Space Manager class that manages the visualizer space, the devices,
 * connections between them, and so on.
 */
export default class SpaceManager {
  /**
   * Create a new SpaceManager instance.
   * @param {string} selector HTML element selector string (eg: ".classname",
   * "#id") for selecting the element within which the SpaceManager operates
   * (visualizer region).
   */
  constructor(selector) {
    /**
     * Visualizer area that you can add devices to, drag them around in, etc.
     * @type HTMLDivElement
     */
    this.vizSpaceElement = document.querySelector(selector);
    if (!this.vizSpaceElement.id) {
      console.error("The visualizer region element needs to have a unique id");
    }

    /**
     * Array that contains instances of classes representing each device
     * placed on screen. Each element is an instance of some class that
     * extends the 'Device' class.
     * @type {[Device, RPi]}
     */
    this.devices = [];

    this.makeDraggables();

    // Create <canvas> to draw lines connecting devices on.
    this.lineCanvElem = this.createLineCanv();
    this.vizSpaceElement.appendChild(this.lineCanvElem);

    // Get the "context" of the canvas, so the program can draw in the canvas.
    this.lineCanvCtx = this.lineCanvElem.getContext("2d");

    // Timeout object for using with window resize event.
    this.windowResizer = null;
    window.addEventListener("resize", (ev) => {
      this.windowResizeListener.apply(this, [ev]);
    });
  }

  /**
   * Add a device to the smart devices space, and returns the device object,
   * if it is valid.
   * @param {string} deviceType The device type name passed in as a string.
   */
  addDevice(deviceType) {
    if (deviceType in deviceClasses) {
      const newDeviceObj = new deviceClasses[deviceType](this, false);
      this.devices.push(newDeviceObj);
      this.vizSpaceElement.appendChild(newDeviceObj.element);
      newDeviceObj.createIllustration(false);

      this.placeDevices();

      return newDeviceObj;
    } else {
      console.error("Invalid device type!");
      return null;
    }
  }

  /**
   * Logs errors and returns false if the devices are not connectable.
   * Returns the device objects (truthy value) in an object, if they
   * are connectable.
   *
   * @param {string} fromId Id of the RPi device that you are connecting
   * the other device to.
   * @param {string} toId Id of the second device that you are connecting
   *  the RPi to.
   * @param {number} [pinNum] Pin number of RPi that the other device is
   * connecting to. Leave blank for automatic/skip.
   * @param {boolean} [tryingConnect] Trying to connect the devices (true)
   * or disconnect them (false).
   * @returns {(boolean | {fromDev : RPi, toDev : Device} )}
   * False if devices are not connectable, {fromDev, toDev} if
   * they are connectable.
   */
  areDevicesConnectable(fromId, toId, pinNum = -1, tryingConnect = true) {
    const fromDev = this.devices.find((dev) => dev.id == fromId);
    const toDev = this.devices.find((dev) => dev.id == toId);

    const errMsg =
      // If either fromDev or toDev aren't valid
      !fromDev || !toDev
        ? `fromId and toId must be valid IDs of devices on screen`
        : // If fromDev is not an RPI
        fromDev.deviceTypeStr !== "RPI"
        ? `fromId must belong to an RPi device. Given: ${fromDev.deviceTypeStr}`
        : // If the device is already connected, and you are trying to connect
        tryingConnect & toDev.isConnected
        ? `toId '${toId}' already connected to RPi '${toDev.connectedTo}'`
        : // If the device is not connected, and you're trying to connect
        !tryingConnect && !toDev.isConnected
        ? `toId '${toId}' is not connected to any RPi`
        : // If there is already a device at that pinNum
        pinNum !== -1 && fromDev.deviceAtPinAlready(pinNum)
        ? `Device ${foundDevAtPin.deviceId} connected to pin number already`
        : "";

    if (errMsg) {
      console.error(errMsg);
      return false;
    }

    return { fromDev, toDev };
  }

  /**
   * Change status of device specified by the given ID.
   * @param {string} deviceId The ID of the device to change status of
   * @param {string} status The status to change the device to
   */
  changeStatus(deviceId, status) {
    this.devices.find((dev) => dev.id == deviceId).changeStatus(status);
  }

  /**
   * Connnect two devices given their IDs. The first device must be an RPi.
   * Returns true if connected appropriately, false otherwise.
   *
   * @param {string} fromId The ID of RPi device that you are connecting the
   * other device to
   * @param {string} toId The ID of the other device that you are connecting the
   * RPi to.
   * @param {number} [pinNum] Optional pin number value to connect the device
   * at. By default it will be set to the next open pin number in the first
   * device, represented by fromId.
   * @returns {boolean} Whether the connection was a success.
   */
  connectDevices(fromId, toId, pinNum = -1) {
    const proceed = this.areDevicesConnectable(fromId, toId, pinNum);
    if (!proceed) return false;

    /** @type {{fromDev : RPi, toDev : Device}} */
    const { fromDev, toDev } = proceed;

    /* Handle the connection if there are no errors: */

    // Connect toDev to specified pinNum of fromDev
    fromDev.addConnectedDevice(toId, pinNum);
    toDev.connectToDevice(fromId);

    // Draw lines connecting devices
    this.drawLines();

    return true;
  }

  /**
   * Function to create the canvas element that draws lines between devices.
   * @returns {HTMLDivElement} The canvas element created.
   */
  createLineCanv() {
    const canvElem = document.createElement("canvas");

    canvElem.class = "visualizer-canvas";
    canvElem.width = this.vizSpaceElement.clientWidth;
    canvElem.height = this.vizSpaceElement.clientHeight;

    return canvElem;
  }

  /**
   * Delete a device from the devices space, given its id string.
   * @param {string} deviceId The ID of the device being deleted.
   * @returns {void}
   */
  deleteDevice(deviceId) {
    // Get the device object
    const delDevice = this.devices.find((dev) => dev.id === deviceId);

    if (!delDevice) {
      console.error(`Device with id '${deviceId}' does not exist in space`);
      return;
    }

    // Call the delete function of the device object.
    delDevice.delete();

    // Delete JS object (from array and eventually from memory).
    this.devices.splice(this.devices.indexOf(delDevice), 1);

    // Redraw lines.
    this.drawLines();
  }

  /**
   * Disconnect an RPi-like device with the ID fromId and the device with the
   * id toId.
   * @param {string} fromId The RPI-like device from which the other device is
   * being disconnected
   * @param {string} toId The ID of the second device being disconnected
   * @param {boolean} [drawLines] Whether to redraw lines on the canvas that
   * connects device elements. True by default.
   * @returns {void}
   */
  disconnectDevices(fromId, toId, drawLines = true) {
    const proceed = this.areDevicesConnectable(fromId, toId, undefined, false);
    if (!proceed) return false;

    /** @type {{fromDev : RPi, toDev : Device}} */
    const { fromDev, toDev } = proceed;

    // Remove connections in both fromDev & toDev devices.
    fromDev.removeConnectedDevice(toId);
    toDev.disconnectFromDevice();

    // Draw lines if drawLines === true
    if (drawLines) this.drawLines();
  }

  /**
   * Listener for move events thrown by the interactable object.
   * @param {Event} event The move event thrown by the drag listener
   * (interactjs)
   * */
  dragMoveListener(event) {
    let target = event.target;
    let x = Math.round((parseFloat(target.dataset.x) || 0) + event.dx);
    let y = Math.round((parseFloat(target.dataset.y) || 0) + event.dy);

    target.style.transform = `translate(${x}px, ${y}px)`;

    target.dataset.x = x;
    target.dataset.y = y;

    // Draw lines connecting devices.
    this.drawLines();
  }

  /**
   * Function that gets called when an object drag ends.
   * Sets the x & y positions in device objects using devX & devY from here.
   * The x & y values are values between 0 and 1, representing it's position
   * within the device space/dotted region - this might be useful for setting
   * the position of the html div, irrespective of resolution/window size.
   *
   * @param {Event} event The drag end event thrown by the drag listener
   * (interactjs)
   * */
  dragEndListener(event) {
    console.log(event);
    const deviceDiv = event.target;
    const deviceId = deviceDiv.id;

    // Find the object for this device from the devices array.
    const deviceObj = this.devices.find((dev) => dev.id == deviceId);

    let devX = Math.abs(
      (
        (parseFloat(deviceDiv.dataset.x) || 0) /
        deviceDiv.parentElement.clientWidth
      ).toFixed(2)
    );
    let devY = Math.abs(
      (
        (parseFloat(deviceDiv.dataset.y) || 0) /
        deviceDiv.parentElement.clientHeight
      ).toFixed(2)
    );

    // Update the object's x & y properties.
    deviceObj.position.x = devX;
    deviceObj.position.y = devY;

    // Draw lines connecting devices.
    this.drawLines();
  }

  /** Draw the lines between connected devices on screen.*/
  drawLines() {
    const ctx = this.lineCanvCtx;

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff40";

    ctx.clearRect(0, 0, this.lineCanvElem.width, this.lineCanvElem.height);

    /**
     * List of all RPi devices on screen.
     * @type RPi[]
     */
    const rPiDevices = this.devices.filter(
      (dev) => dev.deviceTypeStr === "RPI"
    );

    rPiDevices.forEach((rPiObj) => {
      const rPiElem = rPiObj.element;

      // Coordinates to start the line from
      const startX = parseInt(rPiElem.dataset.x) + ~~(rPiElem.clientWidth / 2);
      const startY = parseInt(rPiElem.dataset.y) + ~~(rPiElem.clientHeight / 2);

      // Find and iterate over all connected devices
      rPiObj.connectedDevices.forEach((devPinId) => {
        // Get the device object for the connected device
        const connDevice = this.devices.find(
          (dev) => dev.id === devPinId.deviceId
        );

        // Coordinates to end the line on.
        const endX =
          parseInt(connDevice.element.dataset.x) +
          ~~connDevice.element.clientWidth / 2;
        const endY =
          parseInt(connDevice.element.dataset.y) +
          ~~connDevice.element.clientHeight / 2;

        // Draw the line between the RPi and this connected device.
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX, endY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Clear the rectangle behind each device so the line
        // doesn't appear there.
        [rPiElem, connDevice.element].forEach((elem) => {
          ctx.clearRect(
            parseInt(elem.dataset.x),
            parseInt(elem.dataset.y),
            elem.clientWidth,
            elem.clientHeight
          );
        });
      });
    });
  }

  /** Make .draggable class elements draggable using interact.js */
  makeDraggables() {
    interact(`#${this.vizSpaceElement.id} .draggable`).draggable({
      autoscroll: false,
      ignoreFrom: `#${this.vizSpaceElement.id} .draggable :not(canvas)`,
      inertia: false,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: "parent",
          endOnly: false,
        }),
      ],
      listeners: {
        // The drag-listener methods requires "this" context access -
        // So that it can access this.devices[]., for example.
        // To pass the context when the event calls the function, use .apply()
        // like below, instead of simply saying "end: this.dragEndListener".
        //
        // Read more about .apply():
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
        move: (ev) => this.dragMoveListener.apply(this, [ev]),
        end: (ev) => this.dragEndListener.apply(this, [ev]),
      },
    });
  }

  /**
   * Place the devices on screen correctly, according to their JS object's
   * position.x & position.y values.
   */
  placeDevices() {
    this.devices.forEach((dev) => {
      // Find the new x & y values using the JS object's position object.
      let newX = Math.round(dev.position.x * this.vizSpaceElement.clientWidth);
      let newY = Math.round(dev.position.y * this.vizSpaceElement.clientHeight);

      // Make the device fit within the boundaries of this.vizSpaceElement.
      // X-value:
      if (newX + dev.element.clientWidth > this.vizSpaceElement.clientWidth) {
        newX = this.vizSpaceElement.clientWidth - dev.element.clientWidth;
        dev.position.x = (newX / this.vizSpaceElement.clientWidth).toFixed(2);
      }
      // Y-value:
      if (newY + dev.element.clientHeight > this.vizSpaceElement.clientHeight) {
        newY = this.vizSpaceElement.clientHeight - dev.element.clientHeight;
        dev.position.y = (newY / this.vizSpaceElement.clientHeight).toFixed(2);
      }

      // Set the location on screen for the deviceContainer HTML element.
      dev.element.style.transform = `translate(${newX}px, ${newY}px)`;

      // Set the data attributes that interactjs use.
      dev.element.dataset.x = newX;
      dev.element.dataset.y = newY;
    });
  }

  /**
   * Reload the illustrations on each device on screen.
   * This might be required after the window size gets changed.
   */
  refreshIllustrations() {
    this.devices.forEach((devObj) => {
      devObj.show();
    });
  }

  /**
   * Resizes the elements on the line-drawing canvas size to match
   * the parent elements (visualizer space/dotted region) size.
   */
  resizeLineDrawingCanvas() {
    if (this.lineCanvElem) {
      this.lineCanvElem.width = this.vizSpaceElement.clientWidth;
      this.lineCanvElem.height = this.vizSpaceElement.clientHeight;
    }
  }

  /**
   * When the window is resized, the illustrations have to re-render.
   * However, the "resize" event fires every frame of the browser UI,
   * so we add a timeout - The event is placed on a 50ms delay.
   * 'windowResizer' is a variable for this timeout functionality.
   * Code from: https://stackoverflow.com/a/60204716
   *
   * @param {Event} ev The Window resize event object
   */
  windowResizeListener(ev) {
    // Clear any existing timeout.
    clearTimeout(this.windowResizer);

    // Create a new timeout on a 200ms delay.
    this.windowResizer = setTimeout(() => {
      // Execute these functions on a timeout.

      this.resizeLineDrawingCanvas();
      this.drawLines();
      this.refreshIllustrations();
    }, 50);
  }
}
