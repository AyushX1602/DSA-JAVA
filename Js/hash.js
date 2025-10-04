const crypto = require('crypto');
let input =1;
let hash = '';
while(true){
const hash = crypto.createHash('sha256').update("100xdevs" + input.toString()).digest('hex');
if (hash.startsWith('00000')) {
    console.log(`input:${"100xdevs" + input.toString()}`);
    console.log(`hash:${hash}`);
    break;
}
input++;
}