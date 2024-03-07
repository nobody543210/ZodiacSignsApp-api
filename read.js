const fs = require('fs');

const readHTMLFile = (path, callback) => {
    fs.readFile(path, 'utf8', (err, html) => {
        if (err) {
            console.error('Error reading HTML file:', err);
            callback(err);
            return;
        }
        callback(null, html);
    });
};

module.exports = readHTMLFile;