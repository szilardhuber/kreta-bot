const fs = require('fs');

const getMarks = require('./index.js').handler;

process.env.username = process.env.TF_VAR_username;
process.env.password = process.env.TF_VAR_password;
process.env.webhook_url = process.env.TF_VAR_slack_url;

getMarks({}, null, (err, message) => {
    if (err) {
        console.error("Error while getting marks: ", err);
        return
    }
    try {
        const response = JSON.parse(message.body);
        response.map( mark => {
            console.log(mark);
        })
    } catch (err) {
        console.error("Failed to get response: ", message);
    }
})
