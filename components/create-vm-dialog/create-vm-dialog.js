let { dialog } = remote;
const vagrant = require("node-vagrant");
const { fstat } = require("original-fs");
//const { app, remote } = require('electron');

var newPath;

window.createVim = (e) => {
    e.target.innerHTML = `<span>Creating ...</span><i class="fa fa-fw fa-spin fa-spinner"></i>`;
    e.target.disabled = true;
    (new Promise((resolve, reject) => {

        let selectOs = document.querySelector("#os-select");
        if (selectOs.selectedIndex === 0) {
            return reject("Please Select An Os First.");
        }
        newPath = path.join(remote.getGlobal('rootFolder'), selectOs.value);
        
        alert(newPath);
        if(!fs.existsSync(newPath))
        {
            fs.mkdirSync(newPath);
            var machine = vagrant.create({ cwd: newPath, env: process.env }) // cwd and env default to process' values
            switch(selectOs.value)
            {
                case 'Ubuntu':
                    machine.init(['ubuntu/trusty64'], function (err, out) {
                    });
                    break;
                case 'Raspbian':
                    machine.init(['ubuntu/trusty64'], function (err, out) {
                    });
                    break;
                case 'Centos':
                    machine.init(['ubuntu/trusty64'], function (err, out) {
                    });
                    break;
                default:
                    alert("Unknown OS");
            }
            // perform your operation here
            setTimeout(() => {
                alert("A `Vagrantfile` has been placed in the ~/Documents/Vagrants.")
                resolve(selectOs);
            }, 1000); 
        }
        else
        {
            reject("The OS already exists");
            //resolve(selectOs);
        }
    })).then((selectOs) => {
        var data;
        switch(selectOs.value)
            {
                case 'Ubuntu':
                    data = 
                    `Vagrant.configure("2") do |config| \n` + `
                    config.vm.box = "ubuntu/xenial64" \n ` + `
                    end`;
                    break;
                case 'Raspbian':
                    data = 
                    `Vagrant.configure("2") do |config| \n` + `
                    config.vm.box = "gvfoster/raspbian" \n ` + `
                    config.vm.provision "shell", \n ` + `
                    inline: "sudo apt purge libpam-chksshpwd -y" \n `+
                    `end`;
                    break;
                case 'Centos':
                    data = 
                    `Vagrant.configure("2") do |config| \n` + `
                    config.vm.box = "centos/7" \n` + `
                    end`;
                    break;
                default:
                    alert("Unknown OS");
            }
      fs.writeFileSync(path.join(newPath,"VagrantFile"), data);
      //resolve();
    }).then(() => {
        // on successfull operation close the dialog
        window.close();
    }).catch(err => {
        // alert with error
        dialog.showErrorBox("Error", err.toString());
    }).finally(() => {
        // 
        e.target.disabled = false;
        e.target.innerHTML = `Create`;
    })
}