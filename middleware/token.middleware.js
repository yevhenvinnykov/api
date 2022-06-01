const jwt = require('jsonwebtoken');

verifyToken = (req, res, next) => {
    let token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ error: 'No token provided' });
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
    verifyToken
};