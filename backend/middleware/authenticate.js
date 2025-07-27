const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
    const token = req.cookies.token;

    console.log("Auth cookie:", token);

    // if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //     return res.status(401).json({ message: "Unauthorized access" });
    // }

  
    // const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = {
            id: decoded.user_id,
            role: decoded.role,
            region: decoded.region || null,
        };
        
        next();
    } catch (error) {
        if (error) {
            if (error.name === 'TokenExpiredError') {
              return res.status(401).json({ message: 'Token expired' });
            }
            return res.status(401).json({ message: 'Token invalid' });
          }
        console.log(error);
        return res.status(401).json({ message: "Unauthorized access caught" });    
    }
}
module.exports = authenticate;