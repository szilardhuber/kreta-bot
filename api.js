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
    //const path = `/api/ErtekelesekTanuloApi/GetErtekelesekGrid?sort=&page=1&pageSize=100&group=&filter=&data=%7B%22tanuloId%22%3A%22${userId}%22%7D`;
    const path = `/api/ErtekelesekTanuloApi/GetTanuloErtekelesekGrid?sort=&page=1&pageSize=100&group=&filter=&data=%7B%7D&`
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

const getMarksDetails = (subject) => {
    const pupilId = subject.TanuloId;
    const subjectId = subject.ID;
    const path = `/api/ErtekelesekTanuloApi/GetTanuloErtekelesReszletekGrid?TanuloId=${pupilId}&TantargyId=${subjectId}&sort=&page=1&pageSize=100&data=%7B%7D`;
    const method = 'GET';
    return makeRequest( path, method, JSON.stringify(subject))
        .then( (body) => {
            const data = JSON.parse(body.toString());
            return data.Data;
        })
}

module.exports = {
    login,
    getMarks,
    chooseRole,
    getMarksDetails,
}
