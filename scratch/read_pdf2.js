const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('C:\\Users\\54290\\Downloads\\Manual de custodia-Fuentes\\Silencio_y_Soberanía_Identidad_Integral.pdf');

pdf(dataBuffer).then(function(data) {
    console.log(data.text.substring(0, 5000));
}).catch(console.error);
