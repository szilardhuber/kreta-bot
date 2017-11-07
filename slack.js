const request = require('request');
const moment = require('moment');

const sendMessage = (webhook_url, params) => {
    const ts = moment(params.mark.ErtekelesDatuma);
    const message = `*${params.subject.Nev}* - *${params.mark.result}* ` +
        `(_<!date^${ts.unix()}^{date_num}|${params.mark.ErtekelesDatuma}>_)`
    request({
        uri: webhook_url,
        body: JSON.stringify({ text: message}),
        method: 'POST',
    }, (err, res, body) => {
        if (err) { console.error(err); }
    })
}

module.exports = {
    sendMessage,
}
