const fs = require('fs');
const path = require('path');

fs.readdir(path.join(__dirname, '/secret-folder'), {withFileTypes: true}, (err, files) => {
  if (err)
    console.log(err);
  else {
    files.forEach(file => {
       if(file.isFile()) {
        let el = path.parse(file.name);
        fs.stat(path.join(__dirname, `/secret-folder/${file.name}`), (err, stats) => {
          if (err)
            console.log(err);
          else {
            console.log(`${el.name} - ${el.ext.slice(1)} - ${stats.size/1000}kb`);
          }
        });
       };
    })
  }
});