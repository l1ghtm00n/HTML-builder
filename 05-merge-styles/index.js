const fs = require('fs');
const path = require('path');
const stylesDir = path.join(__dirname, '/styles');
const writeStream = fs.createWriteStream(path.join(__dirname,'/project-dist', 'bundle.css'), 'utf8');

fs.readdir(stylesDir, {withFileTypes: true}, (err, files) => {
    if (err)
      console.log(err);
    else {
      files.forEach(file => {
        let el = path.parse(file.name);
        if (el.ext==='.css') {
            let readStream = fs.createReadStream(path.join(stylesDir, file.name), {encoding: 'utf8'});
            readStream.on('readable', function(){
              let data = readStream.read();
              if (data) {
                writeStream.write(data);
              }
            });
        }
      })
    }
});