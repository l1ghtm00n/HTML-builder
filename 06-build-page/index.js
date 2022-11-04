const fs = require('fs/promises');
const fsHandler = require('fs');
const path = require('path');
const projectDir = '/project-dist';
const assetsDir = '/assets';
const stylesDir = '/styles';
const componentsDir = '/components';

async function clearFolder (dir) {
  try {
    await fs.access(path.join(__dirname, dir), fs.constants.W_OK)
    .then(async () => await fs.rm(path.join(__dirname, dir), { recursive: true }));
  } catch (err) {
    console.error(`Error: "${err}" while deleting ${dir}.`)
  }
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

async function copyFolder(dir) {
  const files = await fs.readdir(path.join(__dirname, dir), {withFileTypes: true});
  for (const file of files) {
    if(file.isFile()) {
      await copyFile(dir, file.name, file.name);
    } else {              
      let newDir =`${dir}/${file.name}`;
      await createFolder(projectDir, newDir);
      await copyFolder(newDir);
    };
  }
}

async function createBundle(dir) {
  const writeStreamBundle = fsHandler.createWriteStream(path.join(__dirname, projectDir, 'style.css'), 'utf8');
  let stylePath = path.join(__dirname, dir);
  const files = await fs.readdir(stylePath, {withFileTypes: true});
  for (const file of files) {
    let el = path.parse(file.name);
    if (el.ext==='.css') {
      let contents = await fs.readFile(path.join(stylePath, file.name), 'utf8');
      writeStreamBundle.write(`${contents}\n`);
    }
  }
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
  for (const file of files) {
    let el = path.parse(file.name);
    let indexComponent = isComponent(textHTML, `{{${el.name}}}`);
    if (el.ext==='.html' && indexComponent!==-1) {
      let contents = await fs.readFile(path.join(dir, file.name), 'utf8');
      let nextTag = textHTML[indexComponent+1];
      // let prevTag = textHTML[indexComponent-1];
      let tab = '    ';
      textHTML[indexComponent+1] = `\n${nextTag}`;
      textHTML.splice.apply(textHTML,[indexComponent,1].concat(contents.split('\n').map((line) => `${tab}${line}`)));
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
  try {
    await clearFolder(projectDir);
    await createFolder(projectDir);
    await createFolder(projectDir,assetsDir);
    await copyFolder(assetsDir);
    await createBundle(stylesDir);
    await copyFile('','template.html','index.html');
    await createHTML(componentsDir);
  } catch(err) {
    console.log(err);
  }
}

buildPage();


