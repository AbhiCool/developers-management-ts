function randomStringOfNumbers (strLength: number, charSet?: string) {
    var result = [];
    
    strLength = strLength || 5;
    charSet = charSet || '0123456789';
    
    while (strLength--) { // (note, fixed typo)
        result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
    }
    
    return result.join('');
}

module.exports = {
    randomStringOfNumbers
}