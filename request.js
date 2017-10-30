// const https = require('https');
const request = require('request');

const globalRequestOptions = {
    hostname: 'https://klik029643001.e-kreta.hu',
    port: 443,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8',
    },
    jar: true,
}

const makeRequest = (path, method, data) => {
    return new Promise( (resolve, reject) => {
        console.log("Making request to: ", path, "\n");
        let options = globalRequestOptions;
        options.uri = globalRequestOptions.hostname + path;
        options.method = method;
        if (data) {
            options.body = data;
        }
        const req = request(options, (err, res, body) => {
            if (res.statusCode != 200 && res.statusCode != 302) {
                return reject(res.statusCode);
            }

            resolve(body);
        })
    })
}

module.exports = {
    makeRequest
}
