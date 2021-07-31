/* 
  Index JS file - starting point of the Device Space Visualizer code.
  A device space manager is initialized with the appropriate element selector
  query string passed in.
 */

import SpaceManager from "./spaceManager.js";

// Initialize the space manager
// This kickstarts the whole thing. The preview modal is filled in,
// event listeners for buttons are added, and much more.
const spaceMan = new SpaceManager("#visualizer");

// Make the space manager available from JS console in browser.
window.spaceMan = spaceMan;
