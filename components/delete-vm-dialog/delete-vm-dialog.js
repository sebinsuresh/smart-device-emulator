let { dialog } = remote;



// Choose folder dialog
window.chooseFolder = (e) => {
    let dir = dialog.showOpenDialogSync(remote.getCurrentWindow(), {
        defaultPath: global.rootFolder,
        properties: ['openDirectory']
    });

    // make sure the selected path is there and vaild
    if (dir && dir[0] && dir[0].length) {
        e.target.value = dir[0];
    }
}


window.deleteVim = (e) => {

    // throw up loading animation
    e.target.innerHTML = `<span>Deleting ...</span><i class="fa fa-fw fa-spin fa-spinner"></i>`;
    e.target.disabled = true;

    // promise encloses the deletion process
    (new Promise((resolve, reject) => {

        let selectedFolder = document.querySelector("#folder");
        if (!selectedFolder.value || selectedFolder.value.length <= 0 || !fs.existsSync(selectedFolder.value)) {
            return reject("Invalid Folder Selected.");
        }
        // perform your operation here

        setTimeout(() => {
            fs.rmdirSync(selectedFolder.value.toString(), { recursive: true });
            resolve();
        }, 1000);
    })).then(() => {
        // on successfull operation close the dialog
        window.close();
    }).catch(err => {
        // alert with error
        dialog.showErrorBox("Error", err.toString());
    }).finally(() => {
        // 
        e.target.disabled = false;
        e.target.innerHTML = `Delete`;
    })
}