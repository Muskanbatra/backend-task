const { Parser } = require('json2csv');

const convertToCSV = (data, fields) => {
    try {
        const parser = new Parser({ fields });
        return parser.parse(data);
    } catch (error) {
        throw error;
    }
};

module.exports = convertToCSV;
