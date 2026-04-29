const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('C:\\Users\\54290\\Downloads\\Manual de custodia-Fuentes\\Custodia_Élite_Doctrina_y_Fundamentos.pdf');

pdf(dataBuffer).then(function(data) {
    // number of pages
    console.log(data.numpages);
    // PDF text
    console.log(data.text.substring(0, 5000)); 
}).catch(err => console.error(err));
