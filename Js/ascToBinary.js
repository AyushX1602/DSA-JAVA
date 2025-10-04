function ascToBinary(ascsiiString) {
    const arr = [];
    for (let i = 0; i < ascsiiString.length; i++) {
        const char = ascsiiString[i];
        arr.push(char.charCodeAt(0));
    }
    return new Uint8Array(arr);
}

const ascii = "Hello";
const bytearray = ascToBinary(ascii);
console.log(bytearray);

// base64
const arr = [72, 101, 108, 108, 111];
const byteArr = new Uint8Array(arr);
const base64Encoded = Buffer.from(byteArr).toString('base64');
console.log(base64Encoded); 