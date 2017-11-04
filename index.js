const { login, getUserId, getMarks, getMarksDetails, chooseRole } = require('./api');
const { sendMessage } = require('./slack');

exports.handler = (event, context, callback) => {
    let message = "Szabolcs jegyei: \n ```";
    let userName, password = null;
    let webhook_url = "https://hooks.slack.com/services/"
    try {
        userName = event["queryStringParameters"]['userName'];
        password = event["queryStringParameters"]['password'];
        webhook_url = webhook_url + event["queryStringParameters"]['api_url'];
    } catch (err) {
        return callback(new Error("userName and password must be defined"), null);
    }
    if (!userName || !password) {
        return callback(new Error("userName and password must be defined in event"), null);
    }
    login(userName, password)
        .then( () => {
            return chooseRole();
        })
        .then( (userId) => {
            return getMarks(userId);
        })
        .then( (subjects) => {
            const output = subjects.map( subject => {
                return getMarksDetails(subject)
                    .then( (marks) => {
                        return marks.map( mark => {
                            const result = mark.ErtekelesSzoveg || mark.Osztalyzat_DNAME;
                            message += `${mark.ErtekelesDatuma}: ${subject.Nev} - ${result} \n` ;
                            return `${subject.ID}, ${mark.ErtekelesDatuma}, ${subject.Nev}, ${mark.Ertekelo}, ${result}`
                        })
                    })
            });
            Promise.all(output).then( values => {
                message += "```";
                sendMessage(webhook_url, message);
                callback(null, { statusCode: 200, body: JSON.stringify(values)});
            })
        })
        .catch( (err) => {
            callback(err, null);
        })
};
