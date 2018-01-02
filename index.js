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
                            .sort((a, b) => a.ID - b.ID)
                            .map( mark => {
                                mark.result = mark.ErtekelesSzoveg || mark.Osztalyzat_DNAME;
                                const param = {
                                    TableName: 'Marks',
                                    Item: {
                                        subject_id: { N: subject.ID.toString() },
                                        mark_id: { N: mark.ID.toString() },
                                        date: { S: mark.ErtekelesDatuma },
                                        subject_name: { S: subject.Nev },
                                        teacher_name: { S: mark.Ertekelo },
                                        mark: { S: mark.result },
                                    },
                                    ReturnValues: 'ALL_OLD',
                                }
                                db.putItem(param, (err, data) => {
                                    // The item did not exist before. It is new, notify Slack about it
                                    if (!err && (!data || !data.Attributes)) {
                                        sendMessage(webhook_url, { mark, subject });
                                        //console.log("Would be sending message: ", mark.ID, subject.ID, mark.ErtekelesDatuma, mark.result);
                                    }
                                });
                                return `${subject.ID}, ${mark.ErtekelesDatuma}, ${subject.Nev}, ${mark.Ertekelo}, ${mark.result}`
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
