const request = require('request');

const sendMessage = (webhook_url, message) => {
    request({
        uri: webhook_url,
        body: JSON.stringify({ text: message}),
        method: 'POST',
    }, (err, res, body) => {
    })
}

module.exports = {
    sendMessage,
}
