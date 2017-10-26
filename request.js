const https = require('https');

const globalRequestOptions = {
    hostname: 'klik029643001.e-kreta.hu',
    port: 443,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8',
    },
}

const makeRequest = (path, method, data, cookie) => {
    if (cookie) {
        globalRequestOptions.headers['Cookie'] = cookie;
    }

    return new Promise( (resolve, reject) => {
        console.log("Making request to: ", path, "\n");
        let options = globalRequestOptions;
        options.path = path;
        options.method = method;
        const req = https.request(options, (res) => {
            if (res.statusCode != 200 && res.statusCode != 302) {
                return reject(res.statusCode);
            }
            let cookies = res.headers['set-cookie'];
            if (cookies) {
                cookies = cookies.map( cookie => {
                    return cookie.split(';')[0];
                })
                res.cookie = cookies.join('; ');
            }

            resolve(res);
        })
        if (data) {
            req.write(data);
        }
        req.end()
    })
}

module.exports = {
    makeRequest
}
