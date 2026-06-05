
const extractNumber = (str) => {
    const match = str.match(/\d+$/);

    if (match) {
        const number = parseInt(match[0], 10);
        return number;
    }

    return false
}

module.exports = {
    extractNumber
}