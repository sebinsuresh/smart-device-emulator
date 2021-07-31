
const { dialog } = remote;



// create a vue on page instance to keep all the things manageable via vue
new Vue({
    el: '#app',
    data: {
        content: '',
        editorRef: null,
        file: null
    },

    // function will trigger on component mount  (alternative to window.onLoad)
    mounted: function () {

        // store Editor Instance Reference inside the state to manipulate the editor from that handle later
        this.editorRef = ace.edit("editor");

        // decide the theme based on the theme of the application
        let theme = "";

        if (remote.nativeTheme.themeSource === 'dark') {
            theme = "ace/theme/twilight";
        } else if (remote.nativeTheme.themeSource === 'light') {
            theme = "ace/theme/eclipse";
        } else if (remote.nativeTheme.shouldUseDarkColors) {
            theme = "ace/theme/twilight";
        } else {
            theme = "ace/theme/eclipse";
        }

        this.editorRef.setTheme(theme);

        // set the language preference for the editor
        this.editorRef.session.setMode("ace/mode/java");


        // let's load the file on start if there is any selected
        if (sessionStorage.getItem("editorFile")) {
            if (fs.existsSync(sessionStorage.getItem("editorFile"))) {
                this.loadFile(sessionStorage.getItem("editorFile"));
            }
        }

    },

    methods: {
        newFile() {
            // show the save file dialog
            return dialog.showSaveDialogSync(null, {
                title: "Save File as",
                buttonLabel: "Save",
            });
        },
        saveAsFile() {
            // create a new file by prompting the user , change the file reference to new and save it
            this.file = this.newFile();
            if (this.file) {
                this.saveFile();
            }
        },
        saveFile() {


            // if file is loaded or selected to edit
            if (this.file) {
                // write the editor contents in the file
                fs.writeFile(this.file, this.editorRef.getValue(), (err) => {
                    if (err) {
                        dialog.showErrorBox("Error", err.toString());
                    }
                })
            } else {
                // if no file opened, create a new one by dialog and save it in
                this.file = this.newFile();
                if (this.file) {
                    this.saveFile();
                }
            }
        },
        closeDoc() {
            // lose the file reference
            this.file = null;
            // set the editor to empty state
            this.editorRef.setValue("");
            // remove file
            sessionStorage.setItem("editorFile", null);
        },
        loadFile(filePath) {

            // read the file
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    dialog.showErrorBox("Error", err.toString());
                } else {
                    // laod file
                    this.file = filePath;
                    // keep copy of the content in the state of component
                    this.content = data.toString();
                    // insert the file in the editor
                    this.editorRef.setValue(data.toString());
                    // save in session
                    sessionStorage.setItem("editorFile", filePath);

                }
            });
        },
        openDoc(e) {
            // open the file via open dialog
            dialog.showOpenDialog(null, {
                title: "Open File in Editor",
                properties: ['openFile']
            }).then(({ canceled, filePaths }) => {
                if (filePaths && filePaths[0]) {
                    // if there is file selected then load file in the editor using the load file method defined above
                    this.loadFile(filePaths[0]);
                }
            })
        },
        aboutDialog() {
            // triggers aboutDialog on window level ... which then triggers the electron's native about dialog
            window.aboutDialog();
        },
        close() {
            // close the window, native function
            window.close();
        }
    }

})