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
                return Promise.resolve();
            } catch (err) {
                return Promise.reject(err)
            }
        });
}

const getMarks = (userId) => {
    const path = `/api/ErtekelesekTanuloApi/GetErtekelesekGrid?sort=&page=1&pageSize=100&group=&filter=&data=%7B%22tanuloId%22%3A%22${userId}%22%7D`;
    const method = 'GET';
    return makeRequest( path, method, null)
        .then( (body) => {
            const data = JSON.parse(body.toString());
            return data.Data;
        })
}

const chooseRole = () => {
    const path = '/Adminisztracio/SzerepkorValaszto'
    const method = 'GET';
    return makeRequest( path, method, null)
        .then( (res) => {
            try {
                return Promise.resolve();
            } catch (err) {
                return Promise.reject(err)
            }
        })
        .catch( (err) => {
            console.error(err);
        });
}

const getMarksDetails = (pupilId, subjectId) => {
    const path = `//api/ErtekelesekTanuloApi/GetErtekelesReszletekGrid?TanuloId=${pupilId}&TantargyId=${subjectId}&sort=&page=1&pageSize=100&data=%7B%7D`;
    const method = 'GET';
    return makeRequest( path, method, null)
        .then( (body) => {
            const data = JSON.parse(body.toString());
            return data.Data;
        })
}

const  getUserId = () => {
    const path = `/Intezmeny/Faliujsag`;
    const method = 'GET';
    const userIdRegexp = /.*felhasznaloID:(\d+) ,.*/
    return makeRequest( path, method, null)
        .then( (body) => {
            const match = userIdRegexp.exec(body);
            if (!match || match.length < 2) {
                throw new Error("Could not find UserID in response");
            }
            return match[1];
        })
}

module.exports = {
    login,
    getMarks,
    chooseRole,
    getMarksDetails,
    getUserId,
}
