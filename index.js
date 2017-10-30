const querystring = require('querystring');
const fs = require('fs');
const { login, getUserId, getMarks, getMarksDetails, chooseRole } = require('./api');

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

login(creds.userName, creds.password)
    .then( () => {
        return chooseRole();
    })
    .then( (cookie) => {
        return getUserId()
    })
    .then( (userId) => {
        console.log("UserID is: ", userId);
        return getMarks(userId);
    })
    .then( (subjects) => {
        subjects.map( subject => {
            getMarksDetails(subject.TanuloId, subject.ID)
                .then( (marks) => {
                    marks.map( mark => {
                        console.log(mark.ErtekelesDatuma, subject.Nev, mark.Ertekelo, mark.ErtekelesSzoveg);
                    })
                })
        });
    }).catch( (err) => {
        console.error("Error while logging in: ", err);
    })
