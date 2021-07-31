import Device from "./device.js";

/**
 * Label class that contains the label Key:value pairs and functionality
 * for each device. The functions that modify the values will update the
 * HTML elements as well as the JS objects.
 */
export default class Label {
  /**
   * Create a Label object.
   * @param {Device} parentObject The Device object that this label is assigned
   * to.
   */
  constructor(parentObject) {
    this.parent = parentObject;

    /**
     * Properties to watch from the parent device.
     * @type [{propName : string, editable: boolean, textArea?: boolean}]
     * */
    this.watchProps = [
      { propName: "name", editable: true },
      { propName: "id", editable: false },
      { propName: "comment", editable: true, textArea: true },
    ];

    /** The JS object containing information for this label.*/
    this.object = {};

    /** Indicates whether the HTML element needs an update.*/
    this.needsElemUpdate = false;

    /** The HTML element for the label.*/
    this.elem = this.createElem();
    this.elem.classList.add("noDisplay");
    this.hide();

    /** @type {HTMLDivElement} */
    this.kvPairsContainerElem = null;

    /**
     * Object containing mappings of each watched property from parent to
     * the k:v pair elements (a label and an input element).
     *
     * @type {Object.<string, {labelElem: HTMLLabelElement, inputElem: HTMLInputElement}>}
     * */
    this.kvPairsElems = {};

    this.parent.element.appendChild(this.elem);

    const interval = 500;
    /**
     * Checks for any changes in parent & updates this.object every
     * <interval> milliseconds.
     * Be careful putting DOM updating code (not performant) in setInterval!!
     *
     * @type {ReturnType<typeof setInterval>}
     *  */
    this.watcher = setInterval(() => {
      this.updateObject();

      // DOM-updating code!
      // Updates the HTML element if the label is currently visible and
      // requires an update.
      if (!this.isHidden && this.needsElemUpdate) this.setKVPairElems();
    }, interval);
  }

  /**
   * Creates the HTML element for this label.
   * @returns {HTMLDivElement}
   */
  createElem() {
    const elem = document.createElement("div");
    elem.classList.add("labelDiv");

    return elem;
  }

  /**
   * Delete the label & clear setIntervals
   */
  delete() {
    clearInterval(this.watcher);
    this.elem.innerHTML = "";
    this.object = null;
    this.parent = null;
  }

  /** Hide the label HTML element. Sets this.isHidden to true. */
  hide() {
    this.elem.classList.add("hiding");
    setTimeout(() => this.elem.classList.add("noDisplay"), 184);
    this.isHidden = true;
  }

  /**
   * Sets (or creates if it doesn't exist) the k:v pair HTML elements and
   * container, and update them with values from this.object.
   * Also sets this.needsElemUpdate to false, since we updated the elem.
   */
  setKVPairElems() {
    if (!this.kvPairsContainerElem) {
      this.kvPairsContainerElem = document.createElement("div");
      this.kvPairsContainerElem.classList.add("kvPairsContainer");
      this.elem.appendChild(this.kvPairsContainerElem);
    }

    // Create k:v pair divs if they don't exist, add listeners, and set values.
    this.watchProps.forEach((obj) => {
      const { propName, editable, textArea } = obj;
      if (this.kvPairsElems[propName] === undefined) {
        // The input element (text field)
        const inputElem = document.createElement(
          textArea ? "textarea" : "input"
        );
        inputElem.id = this.parent.id + "-Label-" + propName;
        inputElem.value = this.object[propName];
        if (!editable) inputElem.disabled = true;
        if (textArea) inputElem.rows = 3;

        // The label element
        const labelElem = document.createElement("label");
        labelElem.innerText = propName + ":";
        labelElem.setAttribute("for", inputElem.id);

        // Add the elements to a div and to this.kvPairsContainersElem.
        const kvPairDiv = document.createElement("div");
        kvPairDiv.appendChild(labelElem);
        kvPairDiv.appendChild(document.createElement("br"));
        kvPairDiv.appendChild(inputElem);
        this.kvPairsContainerElem.appendChild(kvPairDiv);

        // Add listener for the input field, if it is editable, and not
        // an object. The listener updates the parent object.
        if (editable && typeof this.object[propName] !== "object") {
          inputElem.onchange = (ev) => {
            const newVal = ev.target.value;
            this.parent[propName] = newVal;
            this.object[propName] = newVal;
          };
        }

        // Set the values in this.kvPairsElems
        this.kvPairsElems[propName] = { labelElem, inputElem };
      }

      // Update the text content within the input element, if the value in
      // this.object does not match with the input element content.
      const inputElem = this.kvPairsElems[propName].inputElem;
      if (
        typeof this.object[propName] !== "object" &&
        inputElem.value !== this.object[propName]
      ) {
        inputElem.value = this.object[propName];
      }
    });

    // Mark the HTML element as updated.
    this.needsElemUpdate = false;
  }

  /**
   * Change the value for a given key in this label.
   * This will also update the value in the HTML element.
   * @param {string} key The name of key/property you are updating
   * @param {string} val The updated value for the specified key
   */
  setObjectVal(key, val) {
    this.object[key] = val;
    this.needsElemUpdate = true;
  }

  /**
   * Show the label HTML element, after setting the k:v pairs to the latest
   * values. Sets this.isHidden to false.
   */
  show() {
    this.updateObject();
    if (this.needsElemUpdate) this.setKVPairElems();
    this.elem.classList.remove("hiding");
    this.elem.classList.remove("noDisplay");
    this.isHidden = false;
  }

  /** Toggle the hidden status of the label */
  toggleHidden() {
    if (this.isHidden) this.show();
    else this.hide();
  }

  /**
   * Update Label's object based on the latest values from the parent device.
   * Also sets this.needsElemUpdate if there are any properties that changed.
   */
  updateObject() {
    // List of updated properties. Used for marking the label element as
    // needing an update.
    const updatedProps = [];

    // List of keys to remove from being watched.
    const keysToRemove = [];

    // Iterate over all the properties from the parent device being watched,
    // and update any non-existent/unchanged properties in label's object.
    this.watchProps.forEach((prop) => {
      const key = prop.propName;
      if (!(key in this.parent)) {
        // Property not belonging to parent device object is in this.watchProps
        console.warn(
          `Unkown property '${key}' being watched by label (Device: ${this.parent.id}). Removing..`
        );
        keysToRemove.push(key);
      } else if (typeof this.parent[key] === "object") {
        // Show warning only the first time the key is encountered.
        if (this.object[key] === undefined)
          console.warn("Cannot watch objects/arrays properly.");

        // Temporary solution to check if nested object values have changed:
        // Convert to JSON, compare, and store after parsing the string back
        // to JS objects if changed. Possibly inefficient:
        // https://stackoverflow.com/a/5344074
        const oldVal = JSON.stringify(this.object[key]);
        const newVal = JSON.stringify(this.parent[key]);
        if (oldVal !== newVal) {
          this.object[key] = JSON.parse(newVal);
          updatedProps.push(key);
        }
      } else if (this.parent[key] !== this.object[key]) {
        // If there is a value mismatch between parent's property and label's
        // object's property, update the label object.
        this.object[key] = this.parent[key];

        updatedProps.push(key);
      }
    });

    // Remove keys that are unknown - if the keys don't exist in the parent
    // device object.
    keysToRemove.forEach((keyToRemove) => {
      this.watchProps.splice(
        this.watchProps.findIndex((obj) => obj.propName == keyToRemove)
      );
    });

    if (updatedProps.length > 0) {
      // console.log(`#${this.parent.id}'s Label obj updated: ${updatedProps}`);

      // Mark the HTML element as needing an update.
      this.needsElemUpdate = true;
    }
  }
}
