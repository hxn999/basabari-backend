// Function to encode text using Caesar Cipher with letters (a-z) and digits (0-9)
export function cipher(str, shift) {
    let result = '';

    // Loop through each character in the input string
    for (let i = 0; i < str.length; i++) {
        let char = str[i];

        // Check if the character is a lowercase letter (a-z)
        if (char.match(/[a-z]/)) {
            let charCode = str.charCodeAt(i);
            char = String.fromCharCode(((charCode - 97 + shift) % 26) + 97); // Shift within the range of 'a' to 'z'
        }
        // Check if the character is a digit (0-9)
        else if (char.match(/[0-9]/)) {
            let charCode = str.charCodeAt(i);
            char = String.fromCharCode(((charCode - 48 + shift) % 10) + 48); // Shift within the range of '0' to '9'
        }

        // Append the encrypted character to the result
        result += char;
    }

    return result;
}




// Function to decode text using Caesar Cipher with letters (a-z) and digits (0-9)
export function deCipher(str, shift) {
    let result = '';

    // Loop through each character in the input string
    for (let i = 0; i < str.length; i++) {
        let char = str[i];

        // Check if the character is a lowercase letter (a-z)
        if (char.match(/[a-z]/)) {
            let charCode = str.charCodeAt(i);
            char = String.fromCharCode(((charCode - 97 - shift) % 26 + 26) % 26 + 97); // Reverse shift within 'a' to 'z'
        }
        // Check if the character is a digit (0-9)
        else if (char.match(/[0-9]/)) {
            let charCode = str.charCodeAt(i);
            char = String.fromCharCode(((charCode - 48 - shift) % 10 + 10) % 10 + 48); // Reverse shift within '0' to '9'
        }

        // Append the decrypted character to the result
        result += char;
    }

    return result;
}



