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
    fsHandler.readdir(path.join(__dirname, dir), {withFileTypes: true}, (err, files) => {
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

async function createBundle(dir) {
    const writeStreamBundle = fsHandler.createWriteStream(path.join(__dirname, projectDir, 'style.css'), 'utf8');
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

function isComponent(file, component) {
  let i=0;
  while(file[i]!==undefined) {
    if (file[i].indexOf(component)!==-1) {
      return i;
    }
    i++;
  }
  return -1;  
}

async function insertComponents (dir, textHTML) {
  const files = await fs.readdir(dir, {withFileTypes: true});
  let i = 0;
  for (const file of files) {
      let el = path.parse(file.name);
      let indexComponent = isComponent(textHTML, `{{${el.name}}}`);
      if (el.ext==='.html' && indexComponent!==-1) {
          let contents = await fs.readFile(path.join(dir, file.name), 'utf8');
          // contents +='\n';
          // console.log(contents);
          textHTML[indexComponent+1] = `\n${textHTML[indexComponent+1]}`;
          textHTML.splice.apply(textHTML,[indexComponent,1].concat(contents.split('\n').map((line) => `    ${line}`)));
      }
  }
  return textHTML;

}

async function createHTML(dir) {
    let indexHTML;
    let indexPath = path.join(__dirname, projectDir, 'index.html');
    try{
        indexHTML = await fs.open(indexPath);
        let componentPath = path.join(__dirname, dir);
        const line = await fs.readFile(indexPath, 'utf8');
        let newData = await insertComponents(componentPath, line.split('\n'));
        fs.writeFile(indexPath, newData);
    } finally {
        await indexHTML?.close();
    }

}


async function buildPage() {
    // clearFolder(projectDir);
    try {
        let projectFolder = await createFolder(projectDir);
        // let createAssets = await createFolder(projectDir,assetsDir);
        // let copyAssets = await copyFolder(assetsDir);
        // let createCSS = await createBundle(stylesDir);
        let copyIndex = await copyFile('','template.html','index.html');
        let createIndex = await createHTML(componentsDir);
    } catch(err) {
        console.log(err);
    }

}
    
buildPage();


