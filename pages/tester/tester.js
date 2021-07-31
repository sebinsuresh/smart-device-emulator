const Split = require("split.js");
const { dialog } = remote;
const vagrant = require("node-vagrant");


// the split box ... sizing 70 and 30 percent
Split(['#left', '#right'], {
    // options here
    sizes: [70, 30]
});


// second split of the bottom and top portion
Split(['#top', '#bottom'], {
    sizes: [70, 30],
    direction: 'vertical',
    onDragEnd: function (ev) {
        spaceMan.resizeLineDrawingCanvas();
        spaceMan.drawLines();
        spaceMan.refreshIllustrations()
    }
})


/**
 * Global Variables
 * These varibles will be used throughout the application
 */

var programFile = undefined;
var vmFolder = undefined;
var rpi, machine;
var accessoryItem;

var acc_data = [];
/**
 * DOM Elements
 */
var vmFolderDOM = document.getElementById("vmFolderDOM");
var programFileDOM = document.getElementById("programFileDOM");
var output = document.getElementById("output");
var compileButton = document.getElementById("compileButton");
var executeButton = document.getElementById("executeButton");
var accessoryInputs = document.getElementById("accessoryInputs");

/**
 * Window Elements
 */
window.argsIncrement = 0;
window.accessoryIncrement = 0;

/**
 * Window Events
 */

window.argsAdd = () => {
    window.argsIncrement++;
    var field = document.createElement("div");
    field.innerHTML = '<div class="mt-2" id="args' + window.argsIncrement + '"><input name= "argument" class="form-control "type="text" id="args' + argsIncrement + '"/> </div>'; //add input box
    argsData.appendChild(field);
}

window.argsRemove = () => {
    var removefield = document.getElementById("args" + window.argsIncrement);
    if (window.argsIncrement > 0) {
        window.argsIncrement--;
        argsData.removeChild(removefield.parentNode);
    }
}

window.clearOutput = () => {
    let elem = document.querySelector(`pre#output`);
    if (elem)
        elem.innerHTML = '';
}

window.reload = () => {
    window.location.reload();
}

window.userArgsCB = (el) => {
    let argsData = document.querySelector("#argsData");
    if (el.checked) argsData.removeAttribute("hidden");
    else argsData.setAttribute("hidden", "");
}

/* window.ddListCB = (chkBox, el) => {
    if (chkBox.checked) el.removeAttribute("hidden");
    else el.setAttribute("hidden", "");
} */

window.addEventListener('load', () => {
    let useArgs = document.querySelector("#useArguments"),
        dd1 = document.querySelector('#dd1'),
        dd2 = document.querySelector('#dd2'),
        dp1 = document.querySelector('#dp1'),
        dp2 = document.querySelector('#dp2');

    // initial setup of check box based controls
    window.userArgsCB(useArgs);
    /* window.ddListCB(dd1, dp1);
    window.ddListCB(dd2, dp2); */

    // arguments
    let argsAdd = document.querySelector("#argsAdd"),
        argsRemove = document.querySelector("#argsRemove");
    let argsData = document.querySelector("#argsData");
    useArgs.addEventListener('click', (e) => {
        window.userArgsCB(e.target);
    });

    argsAdd.addEventListener('click', () => {
        window.argsIncrement++;
        var field = document.createElement("div");
        field.innerHTML = '<div class="mt-2" id="args' + window.argsIncrement + '"><input name= "argument" class="form-control "type="text" id="args' + argsIncrement + '"/> </div>'; //add input box
        argsData.appendChild(field);
    });

    argsRemove.addEventListener("click", (e) => {
        var removefield = document.getElementById("args" + window.argsIncrement);
        if (window.argsIncrement > 0) {
            window.argsIncrement--;
            argsData.removeChild(removefield.parentNode);
        }
    });

    // dropdown controls
    /* dd1.addEventListener('click', (e) => {
        window.ddListCB(e.target, dp1);
    });

    dd2.addEventListener('click', (e) => {
        window.ddListCB(e.target, dp2);
    }); */
});




// load the editor file from the session storage if it exists
window.addEventListener('load', () => {
    // check if the file exists in the session (via current page or the editor) and load
    if (sessionStorage.getItem("editorFile")) {
        if (fs.existsSync(sessionStorage.getItem("editorFile"))) {
            programFile = sessionStorage.getItem("editorFile").toString();
            programFileDOM.innerHTML = path.basename(programFile);
        }
    }
});


//Events


window.selectProgram = () => {
    if (process.platform !== "darwin") {
        dialog
            .showOpenDialog({
                title: "Select the File to be uploaded",
                buttonLabel: "Upload",
                // Restricting the user to only Java and CPP Files.
                filters: [
                    {
                        name: "Program Files",
                        extensions: ["java", "cpp"],
                    },
                ],
                // Specifying the File Selector Property
                properties: ["openFile"],
            })
            .then((file) => {
                if (!file.canceled) {
                    // Updating the GLOBAL filepath variable
                    // to user-selected file.
                    programFile = file.filePaths[0].toString();
                    programFileDOM.innerHTML = path.basename(programFile);
                    sessionStorage.setItem("editorFile", file.filePaths[0]);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        // If the platform is 'darwin' (macOS)
        dialog
            .showOpenDialog({
                title: "Select the File to be uploaded",
                buttonLabel: "Upload",
                filters: [
                    {
                        name: "Program Files",
                        extensions: ["java", "cpp"],
                    },
                ],
                // Specifying the File Selector and Directory
                // Selector Property In macOS
                properties: ["openFile"],
            })
            .then((file) => {
                if (!file.canceled) {
                    programFile = file.filePaths[0].toString();
                    programFileDOM.innerHTML = path.basename(programFile);
                    sessionStorage.setItem("editorFile", file.filePaths[0]);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }
};

/**
 * Step Two
 */
window.vagrant = () => {
    if (process.platform !== "darwin") {
        dialog
            .showOpenDialog({
                title: "Select the Virtual Machine",
                defaultPath: global.rootFolder,
                buttonLabel: "Select",
                properties: ["openDirectory"],
            })
            .then((folder) => {
                // Stating whether dialog operation was
                // cancelled or not.
                if (!folder.canceled) {
                    // Updating the GLOBAL filepath variable
                    // to user-selected file.
                    vmFolder = folder.filePaths[0].toString();
                    fs.copyFile(
                        programFile,
                        vmFolder + "/" + path.basename(programFile),
                        (err) => {
                            if (err) throw err;
                        }
                    );
                    fs.copyFile(
                        path.dirname(programFile) + "/emulatorCompiler.cpp",
                        vmFolder + "/" + "emulatorCompiler.cpp",
                        (err) => {
                            if (err) throw err;
                        }
                    );
                    new Promise((resolve, reject) => {
                        machine = vagrant.create({ cwd: vmFolder, env: process.env });
                        resolve(machine);
                    }).then((machine) => {
                        alert("The machine will start now. This could take several minutes if the machine is turned off");
                        machine.up(function (err, out) {
                            if (err === null) {
                                machine.reload(function(err, out) {
                                    console.log("Entered");
                                    compileButton.removeAttribute("disabled");
                                    compileButton.style.backgroundColor = "#00FF00";
                                    alert("Ready to Compile now");
                                });
                            }
                            else {
                                alert("Error Occured. ", err)
                            }
                        })
                    });
                }
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        // If the platform is 'darwin' (macOS)
        dialog
            .showOpenDialog({
                title: "Select the folder to be moved",
                buttonLabel: "Select",
                defaultPath: global.rootFolder,
                // Specifying the File Selector and Directory
                // Selector Property In macOS
                properties: ["openDirectory"],
            })
            .then((folder) => {
                if (!folder.canceled) {
                    //console.log(folder.filePaths[0]);
                    vmFolder = folder.filePaths[0].toString();
                    vmFolderDOM.innerHTML = path.basename(vmFolder);
                    rpi = spaceMan.addDevice("RPI");
                    fs.copyFile(
                        programFile,
                        vmFolder + "/" + path.basename(programFile),
                        (err) => {
                            if (err) throw err;
                        }
                    );
                    fs.copyFile(
                        path.dirname(programFile) + "/emulatorCompiler.cpp",
                        vmFolder + "/" + "emulatorCompiler.cpp",
                        (err) => {
                            if (err) throw err;
                        }
                    );
                    new Promise((resolve, reject) => {
                        machine = vagrant.create({ cwd: vmFolder, env: process.env });
                        resolve(machine);
                    }).then((machine) => {
                        alert("The machine will start now. This could take several minutes if the machine is turned off");
                        machine.up(function (err, out) {
                            console.log(err, "Error", out, "Out")
                            if (err === null) {
                                machine.reload(function(err, out) {
                                    console.log("Entered");
                                    compileButton.removeAttribute("disabled");
                                    compileButton.style.backgroundColor = "#00FF00";
                                    alert("Ready to Compile now");
                                });
                            }
                            else {
                                alert("Error Occured. ", err)
                            }
                        })
                    });
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }
}


window.execute = () => {
    var command = "./compiled";
    var inputField = document.getElementsByName("argument");
    for (var i = 0; i < inputField.length; i++) {
        command += " " + inputField[i].value;
    }
    setTimeout(() => {
        machine.on('ssh-err', console.error);
        machine.on("ssh-out", test);
        machine.sshCommand(command);
    }, 1000);
}

window.compile = (e) => {
    output.innerHTML = "";
    compileButton.innerHTML = `<span>Compiling ...</span><i class="fa fa-fw fa-spin fa-spinner"></i>`;
    executeButton.setAttribute("disabled", "");

    // the following line is just to demonstrate the spinner , please remove it
    //new Promise((res) => setTimeout(res, 2000));


    const promise = new Promise((resolve, reject) => {
        move();
        resolve();
    })
        .then(async (data) => {
            output.innerHTML += "The Compilation has begun" + "<br />";
            await javac();
            return "Fourth";
        })
        .catch((err) => {
            console.log(err);
        }).finally(() => {
            compileButton.innerHTML = `<span>Compile</span>`;
        })
}



function move() {
    machine.sshCommand(
        `cp /vagrant/${path.basename(programFile)} /home/vagrant/`
    );
    setTimeout(() => {
        machine.sshCommand(
            `cp /vagrant/emulatorCompiler.cpp /home/vagrant/`
        );
    }, 3000);
    output.innerHTML += "The files have been updated at Virtual Machine" + "<br />";
}

function javac() {
    setTimeout(() => {
        machine.on("ssh-out", test);
        machine.on('ssh-err', console.error);
        machine.sshCommand(`g++ -o compiler emulatorCompiler.cpp`);
        output.innerHTML += "Compiler enabled </br>";
        setTimeout(() => {
            //machine.on("ssh-out", test);
            machine.on('ssh-err', console.error);
            console.log(path.basename(programFile));
            machine.sshCommand(`./compiler compiled.cpp ${path.basename(programFile)}`);
            output.innerHTML += "Program transformed </br>";
            setTimeout(() => {
                //machine.on("ssh-out", test);
                machine.on('ssh-err', console.error);
                machine.sshCommand(`g++ compiled.cpp -o compiled -lwiringPi`);
                executeButton.removeAttribute("disabled");
                executeButton.style.backgroundColor = "#00FF00";
                output.innerHTML += "Compiled </br>";
                console.log("Compiled");
            }, 8000);
        }, 8000);
    }, 10000);


}

function test(output_data) {

    output.innerHTML += output_data + "<br />";
    if (output_data !== null || output_data !== "null") {
        var reformed_Output_Data = output_data.split('\n');
        for (let index = 0; index < (reformed_Output_Data.length - 1); index++) {
            const element = reformed_Output_Data[index];
            if (element.includes("HIGH")) {
                var pinNumber = element.match(/(\d+)/)[0];
                var data_filtered = acc_data.filter((temp_acc) => temp_acc.Pin === pinNumber);
                spaceMan.devices[data_filtered[0].Index].changeStatus("ON");
            }
            else if (element.includes("LOW")) {
                var pinNumber = element.match(/(\d+)/)[0];
                var data_filtered = acc_data.filter((temp_acc) => temp_acc.Pin === pinNumber);
                spaceMan.devices[data_filtered[0].Index].changeStatus("OFF");
            }
            else if (!isNaN(element)) {
                spaceMan.devices[1].changeStatus("ON", element);
            }
        }
        /* if (output_data.includes("\n")) {
            if (output_data.includes("HIGH")) {
                var pinNumber = output_data.match(/(\d+)/)[0];
                var data_filtered = acc_data.filter((temp_acc) => temp_acc.Pin === pinNumber);
                spaceMan.devices[data_filtered[0].Index].changeStatus("ON");
                var partTwo = getSecondPart(output_data);
                var pinNumberTwo = partTwo.match(/(\d+)/)[0];
                data_filtered = acc_data.filter((temp_acc) => temp_acc.Pin === pinNumberTwo);
                spaceMan.devices[data_filtered[0].Index].changeStatus("ON");
            }
            else if (output_data.includes("LOW")) {
                var pinNumber = output_data.match(/(\d+)/)[0];
                var data_filtered = acc_data.filter((temp_acc) => temp_acc.Pin === pinNumber);
                spaceMan.devices[data_filtered[0].Index].changeStatus("OFF");
                var partTwo = getSecondPart(output_data);
                var pinNumberTwo = partTwo.match(/(\d+)/)[0];
                data_filtered = acc_data.filter((temp_acc) => temp_acc.Pin === pinNumberTwo);
                spaceMan.devices[data_filtered[0].Index].changeStatus("OFF");
            }
        }
        else if (output_data.includes("HIGH")) {
            var pinNumber = output_data.charAt(0);
            var data_filtered = acc_data.filter((temp_acc) => temp_acc.Pin === pinNumber);
            spaceMan.devices[data_filtered[0].Index].changeStatus("ON");
        }
        else if (output_data.includes("LOW")) {
            var pinNumber = output_data.charAt(0);
            var data_filtered = acc_data.filter((temp_acc) => temp_acc.Pin === pinNumber);
            spaceMan.devices[data_filtered[0].Index].changeStatus("OFF");
        } */



    }


}

function getSecondPart(str) {
    return str.split('\n')[1];
}

var library = document.getElementById("library-select");
library.addEventListener("change", () => {
    fs.copyFile(
        path.dirname(programFile) + "/WiringPi.tar.gz",
        vmFolder + "/" + "WiringPi.tar.gz",
        (err) => {
            if (err) throw err;
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    machine.on("ssh-out", test);
                    machine.on('ssh-err', console.error);
                    machine.sshCommand(`tar xf WiringPi.tar.gz`);
                    resolve();
                }, 2000);                
            })
                .then(() => {
                    setTimeout(() => {
                        machine.on("ssh-out", test);
                        machine.on('ssh-err', console.error);
                        machine.sshCommand(`./build`);
                        resolve();
                    }, 1000); 
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    );

    
})

/**
 * Accessory 
 */

window.addAccessory = () => {

    var accessory = addingAccessory(window.accessoryIncrement++);

    accessoryInputs.appendChild(accessory);

}

window.removeAccesory = () => {
    console.log("input" + window.accessoryIncrement);
    var removeAccesory = document.getElementById("input" + --window.accessoryIncrement);
    accessoryInputs.removeChild(removeAccesory);
    console.log("Removing ", acc_data[window.accessoryIncrement].accessoryID)
    spaceMan.deleteDevice(acc_data[window.accessoryIncrement].accessoryID);
    acc_data.pop();

}

addingAccessory = (increment) => {
    var field = document.createElement("div");
    field.className = "";
    field.id = "input" + increment;
    field.classList.add("dynamic-field");

    var accessoryName = ["Select Accesory", "LED", "MOTOR", "SENSOR"];
    var pinNumbers = ["Select Pin Number", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25"];

    var dd1 = createDropDown(accessoryName, "accessoryName", "accessoryName", "Select Accessory", increment);

    field.appendChild(dd1);

    var dd2 = createDropDown(pinNumbers, "pinNumber", "pinNumber", "Select Accessory", increment);



    field.appendChild(dd2);

    var button = document.createElement("button");
    button.innerHTML = "Submit";
    button.type = button;
    button.className = "class0";
    button.id = "button" + increment;
    button.classList.add("men-button", "shadow-effect", "animate-ripple", "dynamic-button");


    // change the dd1 && dd2 back to the select ref
    dd1 = dd1.querySelector("select");
    dd2 = dd2.querySelector("select");

    button.addEventListener("click", () => {
        if (dd1.value === "LED" && dd2.value !== "Select Pin Number") {
            accessoryItem = spaceMan.addDevice("LED");
            acc_data.push({ "accessoryID": accessoryItem.id, "Pin": dd2.value, "Index": accessoryItem.indexThisType });
            setTimeout(() => {
                spaceMan.connectDevices("RPI1", accessoryItem.id)
            }, 1000);
        }
        else if (dd1.value === "SENSOR" && dd2.value !== "Select Pin Number") {
            accessoryItem = spaceMan.addDevice("THERMOMETER");
            acc_data.push({ "accessoryID": accessoryItem.id, "Pin": dd2.value, "Index": accessoryItem.indexThisType });
            setTimeout(() => {
                spaceMan.connectDevices("RPI1", accessoryItem.id)
            }, 1000);
        }
        console.log(acc_data);
    })

    field.appendChild(button);
    return field;
}

createDropDown = (values, name, id, label, increment) => {

    // create a wrapper div for the dropdown
    let holder = document.createElement("div");
    holder.classList.add("select");
    // artificial arrow for the dropdown since it is a custom design
    let arrow = document.createElement("div");
    arrow.classList.add("select__arrow");
    var select = document.createElement("select");
    select.name = name;
    select.id = id + increment;
    select.style.marginTop = "10px";

    for (const val of values) {
        var option = document.createElement("option");
        option.value = val;
        option.text = val.charAt(0).toUpperCase() + val.slice(1);
        select.appendChild(option);
    }
    var label = document.createElement("label");
    label.innerHTML = "Select: ";
    label.htmlFor = id;

    // append the select element to wrapper
    holder.appendChild(select);
    // append arrow in there
    holder.appendChild(arrow);
    // return wrapper
    return holder;
}
