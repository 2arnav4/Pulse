const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // 1. Get the token from the header
    const token = req.header("Authorization");

    // Check if no token is provided
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // 2. Verify token (remove "Bearer " part if present)
        const tokenString = token.replace('Bearer', '');
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
        // 3. Add user id to the request object so routes can use it 
        req.user = decoded;

        //4. Move to the next function (the actual route)
        next();
    } catch (error) {
        // 5. If token is invalid, return 401
        res.status(401).json({ message: 'Token is not valid' });
    }
};
