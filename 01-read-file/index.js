const fs = require("fs");
const path = require('node:path');
 
const readStream = fs.createReadStream(path.resolve(__dirname, "text.txt"), {encoding: 'utf8'});
readStream.on('readable', function(){
    let data = readStream.read();
    if (data) {
        console.log(data);
    }    
});
