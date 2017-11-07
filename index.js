const { login, getUserId, getMarks, getMarksDetails, chooseRole } = require('./api');
const { sendMessage } = require('./slack');

var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

var db = new AWS.DynamoDB();

exports.handler = (event, context, callback) => {
    const userName = process.env.username;
    const password = process.env.password;
    const webhook_url = `https://hooks.slack.com/services/${process.env.webhook_url}`
    if (!userName || !password || !webhook_url) {
        return callback(new Error("username, password and webhook_url must be in env"), null);
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
                        return marks
                            .sort((a, b) => a.rnum_ - b.rnum_)
                            .map( mark => {
                                const result = mark.ErtekelesSzoveg || mark.Osztalyzat_DNAME;
                                const param = {
                                    TableName: 'Marks',
                                    Item: {
                                        subject_id: { N: subject.ID.toString() },
                                        rnum: { N: mark.rnum_.toString() },
                                        date: { S: mark.ErtekelesDatuma },
                                        subject_name: { S: subject.Nev },
                                        teacher_name: { S: mark.Ertekelo },
                                        mark: { S: result },
                                    },
                                    ReturnValues: 'ALL_OLD',
                                }
                                db.putItem(param, (err, data) => {
                                    // The item did not exist before. It is new, notify Slack about it
                                    if (!err && (!data || !data.Attributes)) {
                                        const message = 'Új jegy:  ``` ' +
                                            `${mark.ErtekelesDatuma}: ${subject.Nev} - ${result}` +
                                            '```'
                                        sendMessage(webhook_url, message);
                                    }
                                });
                                return `${subject.ID}, ${mark.ErtekelesDatuma}, ${subject.Nev}, ${mark.Ertekelo}, ${result}`
                            })
                    })
            });
            Promise.all(output).then( values => {
                callback(null, { statusCode: 200, body: JSON.stringify(values)});
            })
        })
        .catch( (err) => {
            callback(err, null);
        })
};
