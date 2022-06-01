const jwt = require('jsonwebtoken');

verifyOptionalToken = (req, res, next) => {
    let token = req.headers['x-access-token'];
    if (!token){
        next();
        return;
    } 
    jwt.verify(token, process.env.JWT_SECRET, {
        expiresIn: 3600
    }, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        req.userId = decoded.id;
        next();
    });
};

module.exports = {
    verifyOptionalToken
};