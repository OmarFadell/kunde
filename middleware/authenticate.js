const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    console.log("Auth Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized access" });
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.user_id,
            role: decoded.role,
            region: decoded.region || null,
        };
        
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Unauthorized access caught" });    
    }
}
module.exports = authenticate;