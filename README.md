# Smart Space Visualizer

## About

An electron app to emulate an Internet of Things (IoT) space. Made as part of the research paper "..." by "..." at Northeastern Illinois University.

## The Project Directory

The project is split into various folders based on their functionality.

- `/`

The root directory contains the starting point for the Electron app, including the package information and commands to start the application using `npm`. The file `main.js` (...)

- `/assets/`

The assets directory contains the bootstrap files and other important files for the interface!

- `/components/`

The components directory includes folders used to create and delete virtual machine

- `/create-vm-dialog/`  
  This folder contains HTML and CSS code to create virtual machine. Documents folder contains a folder called 'Vagrant'. It contains all the sub-directories of the virtual machines.
- `/delete-vm-dialog/`  
  This folder contains HTML and CSS code to delete virtual machine. The virtual machine operating system sub-directory is deleted upon request.

- `/Pages/`

  The pages directory incldues three sub foler. These folder hold the JS and HTML files for each and every tab in the interface

  - `/editor/`

  The editor sub-directory within pages contains JS, HTML and CSS folder to the editor tab. The editor tab is used to create or edit programs. It is easy access tool to edit your code before uploading it for testing

  - `/index/`

  The index sub-directory within pages contains HTML and CSS for the tab itself. The HTML code is within these sub-directories

  - `/spaceman-assets/`

  The spaceman-assets sub-directory within pages contain the code for the smart space visualizer's "space manager".
  The space manager contains the webpage with illustrations for representing the smart devices, allowing the user to visualize the smart space and interact with them.
  The current version of the space manager does not allow the user to connect smart devices with each other, or change their statuses.
  The user can (by interacting with the GUI) add comments to each device and modify the name given to it, and drag the devices around, etc.
  (Although, if they are familiar with the API/functions provided by SpaceManager, they can manipulate the devices in all sorts of way using console commands)

  Within the directory you have a self-contained HTML page, JS files, and CSS required to use the visualizer via browser yourself if you serve that folder to a browser.

  - `/tester/`

  The tester sub-directory within pages is the main folder of this interface. This folder contains JS, HTML and CSS of the tester tab. The tester tab is divided into three sections. The first section is used to select and upload the program to virtual machine. The second part is where the output of the program is written. The third part utilizes the spaceman-assets to create a graphical user interface. It allows your to select LED and Sensor to be utilized for the program.

### Screenshots

- The app - home screen
  <img src="screenshots/electron-home.png">

- Code editor within the app
  <img src="screenshots/">

- Tester tab: Uninitialized
  <img src="screenshots/electron-tester-initial.png">

- Tester tab: Adding and running code on emulated devices in smart space
  <img src="screenshots/">

- Space Manager running in the browser
  <img src="screenshots/spaceman-browser-devices.png">

## How to install and run the IoT Emulator

### Package/tools/frameworks needed

- NodeJS: [Link](https://nodejs.org/en/). For building & running the emulator GUI.
- Vagrant: [Link](https://www.vagrantup.com/downloads). For creating the virutal machines for operating systems like RaspbianOS that the emulator interfaces with.
- Virtual Box [Link](https://www.virtualbox.org/wiki/Downloads). Virtual Box is used in the background to host the virtual machines.

### Steps to install & run in development mode

1. Download and install NodeJS, Vagrant and Virtual box
2. Clone the code from this repo using: `git clone https://github.com/sebinsuresh/smart-device-emulator.git`
3. Open terminal or command prompt.
4. Locate to the folder "smart-devices-emulator".
5. Run "npm install".
6. Now execute it by running "npm start"

### Steps to install & run in production mode

1. Download and install NodeJS, Vagrant and Virtual box
2. Download Smart devices and Emulator from the website.
3. Follow the instructions to install it.
4. Run the application.

## Contact US

- A-Khaled@neiu.edu Ahmed Khaled, CS department at Northeastern Illinois University.
- M-Ashfaq@neiu.edu Mohammed Ashfaq, Northeastern Illinois University.
- sputhenthara@neiu.edu Sebin Puthenthara Suresh, Northeastern Illinois University.

### Read more about this project: [Link to paper](...)
