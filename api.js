const { makeRequest } = require('./request');

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
    const path = '/api/ErtekelesekTanuloApi/GetErtekelesekGrid?sort=&page=1&pageSize=100&group=&filter=&data=%7B%22tanuloId%22%3A%22173284%22%7D';
    const method = 'GET';
    return makeRequest( path, method, null, cookie)
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
    const path = '/Adminisztracio/SzerepkorValaszto'
    const method = 'GET';
    return makeRequest( path, method, null, cookie)
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
    const path = `//api/ErtekelesekTanuloApi/GetErtekelesReszletekGrid?TanuloId=${pupilId}&TantargyId=${subjectId}&sort=&page=1&pageSize=100&data=%7B%7D`;
    const method = 'GET';
    return makeRequest( path, method, null, cookie)
        .then( (res) => {
            return new Promise( (resolve, reject) => {
                res.on('data', (buffer) => {
                    const data = JSON.parse(buffer.toString());
                    return resolve(data.Data);
                })
            })
        })
}

module.exports = {
    login,
    getMarks,
    chooseRole,
    getMarksDetails,
}
