const fs = require('fs');

let creds = null;
try {
    creds = JSON.parse(fs.readFileSync("config.json"));
} catch (err) {
    console.log("You need a file named config.json containing userName and password");
    console.log(`
        {
            "userName": "<your-username>",
                "password": "<your-password>"
        }
        `);
    process.exit(1);
}

const getMarks = require('./index.js').handler;

getMarks({ queryStringParameters: creds}, null, (err, message) => {
    if (err) {
        console.error("Error while getting marks: ", err);
        return
    }
    try {
        const response = JSON.parse(message.body);
        response.map( mark => {
            console.log(mark);
            //console.log(mark.ErtekelesDatuma, subject.Nev, mark.Ertekelo, mark.ErtekelesSzoveg);
        })
    } catch (err) {
        console.error("Failed to get response: ", message);
    }
})
