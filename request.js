const request = require('request');

const hostname = 'https://klik029643001.e-kreta.hu';
const globalRequestOptions = {
    headers: {
        'Content-Type': 'application/json; charset=UTF-8',
    },
    jar: true,
}

const makeRequest = (path, method, data) => {
    return new Promise( (resolve, reject) => {
        let options = globalRequestOptions;
        options.uri = hostname + path;
        options.method = method;
        if (data) {
            options.body = data;
        }
        const req = request(options, (err, res, body) => {
            if (err) {
                return reject(err);
            }

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
