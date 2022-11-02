const fs = require('fs');
const path = require('path');

fs.mkdir(path.join(__dirname, '/files-copy'), { recursive: true }, (err) => {
    if (err) {
      return console.error(err);
    }
    fs.readdir(path.join(__dirname, '/files-copy'), (err, files) => {
      if (err) throw err;
      for (const file of files) {
          fs.unlink(path.join(__dirname, `/files-copy/${file}`), (err) => {
          if (err) throw err;
        });
      }
    });
    fs.readdir(path.join(__dirname, '/files'), {withFileTypes: true}, (err, files) => {
      if (err)
        console.log(err);
      else {
        files.forEach(file => {
          if(file.isFile()) {
            fs.copyFile(path.join(__dirname, `/files/${file.name}`),
                        path.join(__dirname, `/files-copy/${file.name}`),
                        fs.constants.COPYFILE_FICLONE, ()=>{console.log(`File ${file.name} copied!`)});
          };
        })
      }
    });
    console.log('Directory created successfully!');
});
