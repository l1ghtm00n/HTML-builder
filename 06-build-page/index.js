const fs = require('fs/promises');
const fsHandler = require('fs');
const path = require('path');
const projectDir = '/project-dist';
const assetsDir = '/assets';
const stylesDir = '/styles';
const componentsDir = '/components';

function clearFolder (dir) {
    fs.readdir(path.join(__dirname, dir), {withFileTypes: true}, (err, files) => {
        if (err) throw err;
        
        for (const file of files) {
            
          if(file.isFile()) {
            fs.unlink(path.join(__dirname, `${dir}/${file.name}`), (err) => {
              if (err) throw err;            
            });
          } else {
            let newDir = `${dir}/${file.name}`;
            console.log(newDir);
            fs.rmdir(path.join(__dirname, newDir), (err) => {
                if (err) {
                    clearFolder(newDir);
                } 
            });
          }
        }
    });
}

async function createFolder (...dir) {
    let folders;
    try {
        folders = await fs.mkdir(path.join(__dirname, dir.join('')), { recursive: true });
    } catch (error) {
        console.log(err);
    }    
}

async function copyFile (dir, fileFrom, fileTo) {
    let files;
    try {
        files = await fs.copyFile(path.join(__dirname, dir,`/${fileFrom}`),
                                  path.join(__dirname, projectDir, dir,`/${fileTo}`),
                                  fs.constants.COPYFILE_FICLONE);
    } catch (err) {
        console.log(err);
    }
}

function copyFolder(dir) {
    fs.readdir(path.join(__dirname, dir), {withFileTypes: true}, (err, files) => {
        if (err)
          console.log(err);
        else {
          files.forEach(file => {
            if(file.isFile()) {
              copyFile(dir, file.name, file.name);
            } else {              
              let newDir =`${dir}/${file.name}`;
              createFolder(projectDir, newDir);
              copyFolder(newDir);
            };
          })
        }
      });
}

function createBundle(dir) {
    const writeStreamBundle = fs.createWriteStream(path.join(__dirname, projectDir, 'style.css'), 'utf8');
    let stylePath = path.join(__dirname, dir);
    fs.readdir(stylePath, {withFileTypes: true}, (err, files) => {
        if (err)
          console.log(err);
        else {
          files.forEach(file => {
            let el = path.parse(file.name);
            if (el.ext==='.css') {
                let readStream = fs.createReadStream(path.join(stylePath, file.name), {encoding: 'utf8'});
                readStream.on('readable', function(){
                  let data = readStream.read();
                  if (data) {
                    writeStreamBundle.write(`${data}\n`);
                  }
                });
            }
          })
        }
    });
}

async function createHTML(dir) {
    let indexHTML;
    try{
        indexHTML = await fs.open(path.join(__dirname, projectDir, 'index.html'));
        const writeStreamHTML = indexHTML.createWriteStream();
        let indexPath = path.join(__dirname, dir);
        const files = await fs.readdir(indexPath, {withFileTypes: true});              
        files.forEach(async file => {
            let el = path.parse(file.name);
            if (el.ext==='.html') {
                let readStream = fsHandler.createReadStream(path.join(indexPath, file.name), {encoding: 'utf8'});
                readStream.on('readable', function(){
                  let data = readStream.read();
                  if (data) {
                    console.log(data);
                    // writeStream.write(`${data}\n`);
                  }
                });
            }
        });
    } finally {
        await indexHTML?.close();
    }

}


async function buildPage() {
    // clearFolder(projectDir);
    try {
        let projectFolder = await createFolder(projectDir);
        // createFolder(projectDir,assetsDir);
        // copyFolder(assetsDir);
        // createBundle(stylesDir);
        let copyIndex = await copyFile('','template.html','index.html');
        let createIndex = await createHTML(componentsDir);
    } catch(err) {
        console.log(err);
    }

}
    
buildPage();


