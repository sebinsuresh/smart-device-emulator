const $ = jQuery = require("jquery");
const path = require("path");
const { remote } = require("electron");
const { BrowserWindow } = remote;
const fs = require("fs");


// show the about dialog (window namespaced function)
window.aboutDialog = () => {
    remote.app.showAboutPanel();
}


// sycn the currently selected theme with the ui controls
window.themeControlSetup = () => {
    if (remote.nativeTheme.themeSource === 'light') {
        $("#themeToggle").html("Dark Mode")
    } else {
        $("#themeToggle").html("Light Mode")
    }
}


// toggle theme function // toggle betweeen light and dark
window.toggleTheme = () => {
    const Store = new (require('electron-store'))();
    remote.nativeTheme.themeSource = remote.nativeTheme.themeSource === 'dark' ? 'light' : 'dark';
    Store.set('appTheme', remote.nativeTheme.themeSource);
    // sync the ui controls to current theme 
    themeControlSetup();
}



// navigate between the files
const navigate = (file, popup) => {
    setTimeout(() => {
        // create loading animation wrapper
        let loader = document.createElement("div");
        loader.classList.add("a-loader");
        loader.style.display = 'none';
        // create loading icon
        let loadingIcon = document.createElement("i");
        loadingIcon.style.display = 'none';
        loadingIcon.classList.add("fa", "fa-fw", "fa-circle-o-notch", "fa-spin");
        // append icon to loading wrapper and append wrapper to body
        loader.appendChild(loadingIcon);
        document.body.appendChild(loader);
        // perform the shutter animation to show the loader
        $(loader).slideToggle("fast", () => {
            $(loadingIcon).fadeToggle();
            setTimeout(() => {
                let win = remote.getCurrentWindow();
                // Load the next page in there
                win.loadFile(file);
            }, 200);
        });
    }, 300);
}



// new vim Dialog
const newVimDialog = (e) => {
    // create a new vim dialog window
    let dialog = new BrowserWindow({
        width: 300,
        height: 180,
        webPreferences: {},
        title: "Create a new Vim",
        parent: remote.getCurrentWindow(),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false,
            enableRemoteModule: true
        },
        center: true,
        resizable: false,
        show: false,
        modal: true
    });



    // load the html page
    dialog.loadFile("./components/create-vm-dialog/create-vm-dialog.html");
    // when ready to show.. show it
    dialog.on('ready-to-show', () => {
        setTimeout(() => {
            dialog.show();
        }, 100);
    });

}

window.newVimDialog = newVimDialog;


const deleteVimDialog = (e) => {
    // create a new vim dialog
    let dialog = new BrowserWindow({
        width: 300,
        height: 180,
        webPreferences: {},
        title: "Delete a new Vim",
        parent: remote.getCurrentWindow(),

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false,
            enableRemoteModule: true
        },
        center: true,
        resizable: false,
        show: false,
        // opacity: 0,
        modal: true
    });


    // load the html page
    dialog.loadFile("./components/delete-vm-dialog/delete-vm-dialog.html");
    // when ready to show.. show it
    dialog.on('ready-to-show', () => {
        setTimeout(() => {
            dialog.show();

        }, 100);
    });

}

window.deleteVimDialog = deleteVimDialog;

// export both functions to access them in other js file (in case of common js import)
module.exports = {
    newVimDialog,
    deleteVimDialog
}

window.addEventListener('load', () => {
    // make sure the theme is synced with the theme toggle controls
    window.themeControlSetup();

    // hide loader which is by default in every page
    $(".a-loader i").fadeToggle('fast', () => {
        $(".a-loader").slideToggle("fast");
    });


    // ripples effect when clicked on a button having .animate-ripple class
    document.addEventListener('click', (e) => {
        let target = e.originalTarget || e.target;
        if (target.matches(".animate-ripple") || target.matches(".animate-ripple *")) {
            const elem = target;
            const circle = document.createElement("span");
            const diameter = Math.max(elem.clientWidth, elem.clientHeight);
            const radius = diameter / 2;
            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - (elem.offsetLeft + radius)}px`;
            circle.style.top = `${e.clientY - (elem.offsetTop + radius)}px`;
            circle.classList.add("ripple");
            const ripple = elem.getElementsByClassName("ripple")[0];
            if (ripple) {
                ripple.remove();
            }
            elem.appendChild(circle);
        }
    });


    // routing via route-link attribute (just to make code less bulkier)
    document.addEventListener('click', (e) => {
        // if target matches or it's parent matches the attribute (in case of icon in button)
        if (e.target.matches(`[route-link]`) || e.target.matches(`[route-link] *`)) {
            let a = e.target;
            // call the navigate function with the link attrubute's value
            navigate(a.getAttribute("route-link") || e.target.closest('[route-link]').getAttribute('route-link'), false);
        } else if (e.target.hasAttribute("@click")) {
            // if the element has an @click attribute then perform the action on window's context
            let a = e.target;
            // execute the function name in attribute on windows with event as the argument
            window[a.getAttribute('@click')](e);
        }
    });
})