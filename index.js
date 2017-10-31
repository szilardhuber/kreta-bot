const { login, getUserId, getMarks, getMarksDetails, chooseRole } = require('./api');

exports.handler = (event, context, callback) => {
    let userName, password = null;
    try {
        userName = event["queryStringParameters"]['userName'];
        password = event["queryStringParameters"]['password'];
    } catch (err) {
        return callback(new Error("userName and password must be defined"), null);
    }
    if (!userName || !password) {
        return callback(new Error("userName and password must be defined in event"), null);
    }
    login(userName, password)
        .then( () => {
            return chooseRole();
        })
        .then( (cookie) => {
            return getUserId()
        })
        .then( (userId) => {
            return getMarks(userId);
        })
        .then( (subjects) => {
            const output = subjects.map( subject => {
                return getMarksDetails(subject.TanuloId, subject.ID)
                    .then( (marks) => {
                        return marks.map( mark => {
                            return `${subject.ID}, ${mark.ErtekelesDatuma}, ${subject.Nev}, ${mark.Ertekelo}, ${mark.ErtekelesSzoveg}`
                        })
                    })
            });
            Promise.all(output).then( values => {
                callback(null, { statusCode: 200, body: JSON.stringify(values)});
            })
        }).catch( (err) => {
            callback(err, null);
        })
};
