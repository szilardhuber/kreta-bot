const https = require('https');
const querystring = require('querystring');
const fs = require('fs');

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

const globalRequestOptions = {
    hostname: 'klik029643001.e-kreta.hu',
    port: 443,
    headers: {
        'Content-Type': 'application/json; charset=UTF-8',
    },
}

const makeRequest = (path, method, data) => {
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

const login = (userName, password) => {
    var postData = JSON.stringify({
        UserName: userName,
        Password: password,
    })

    const path = '/Adminisztracio/Login/LoginCheck';
    const method = 'POST';
    return makeRequest( path, method, postData)
        .then( res => {
            try {
                return Promise.resolve(res.cookie);
            } catch (err) {
                return Promise.reject(err)
            }
        });
}

const getMarks = (cookie) => {
    globalRequestOptions.headers['Cookie'] = cookie;
    const path = '/api/ErtekelesekTanuloApi/GetErtekelesekGrid?sort=&page=1&pageSize=100&group=&filter=&data=%7B%22tanuloId%22%3A%22173284%22%7D&_=1509004297878';
    const method = 'GET';
    return makeRequest( path, method)
        .then( (res) => {
            return new Promise( (resolve, reject) => {
                res.on('data', (buffer) => {
                    const data = JSON.parse(buffer.toString());
                    return resolve(data.Data);
                })
            })
        })
}

const chooseRole = (cookie) => {
    globalRequestOptions.headers['Cookie'] = cookie;
    const path = '/Adminisztracio/SzerepkorValaszto'
    const method = 'GET';
    return makeRequest( path, method)
        .then( (res) => {
            try {
                return Promise.resolve(res.cookie);
            } catch (err) {
                return Promise.reject(err)
            }
        })
        .catch( (err) => {
            console.error(err);
        });
}

const getMarksDetails = (cookie, pupilId, subjectId) => {
    globalRequestOptions.headers['Cookie'] = cookie;
    const path = `//api/ErtekelesekTanuloApi/GetErtekelesReszletekGrid?TanuloId=${pupilId}&TantargyId=${subjectId}&sort=&page=1&pageSize=100&data=%7B%7D`;
    const method = 'GET';
    return makeRequest( path, method)
        .then( (res) => {
            return new Promise( (resolve, reject) => {
                res.on('data', (buffer) => {
                    const data = JSON.parse(buffer.toString());
                    return resolve(data.Data);
                })
            })
        })
}

let authCookie = null;
const pupilId = 173284;
login(creds.userName, creds.password)
    .then( (cookie) => {
        return chooseRole(cookie);
    })
    .then( (cookie) => {
        authCookie = cookie
        return getMarks(authCookie);
    })
    .then( (subjects) => {
        console.log("OK ");
        subjects.map( subject => {
            getMarksDetails(authCookie, pupilId, subject.ID)
                .then( (marks) => {
                    marks.map( mark => {
                        console.log(mark.ErtekelesDatuma, subject.Nev, mark.Ertekelo, mark.ErtekelesSzoveg);
                    })
                })
        });
    }).catch( (err) => {
        console.error("Error while logging in: ", err);
    })
