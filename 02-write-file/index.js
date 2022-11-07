const process = require('process');
const fs = require('fs');
const path = require('path');

function end() {
    console.log('End of writing');
    process.exit();
}

const writeStream = fs.createWriteStream(path.resolve(__dirname, 'text.txt'), 'utf8');
console.log('Beginning of task "02 write file". Please begin to write some text:');
process.stdin.on('data', chunk => {
    const text = chunk.toString().trim();
    if (text == 'exit') {
        end();        
    } else {
        writeStream.write(`${text}\n`);        
    }     
});

process.on('SIGINT',end);
 



