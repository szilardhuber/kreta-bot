const querystring = require('querystring');
const fs = require('fs');
const { login, getMarks, getMarksDetails, chooseRole } = require('./api');

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

let authCookie = null;
login(creds.userName, creds.password)
    .then( (cookie) => {
        return chooseRole(cookie);
    })
    .then( (cookie) => {
        authCookie = cookie
        return getMarks(authCookie);
    })
    .then( (subjects) => {
        console.log("OK ");
        subjects.map( subject => {
            getMarksDetails(authCookie, subject.TanuloId, subject.ID)
                .then( (marks) => {
                    marks.map( mark => {
                        console.log(mark.ErtekelesDatuma, subject.Nev, mark.Ertekelo, mark.ErtekelesSzoveg);
                    })
                })
        });
    }).catch( (err) => {
        console.error("Error while logging in: ", err);
    })
