const {ROLE_PERMISSIONS} = require("../utils/rolePermissions");

function authorize(requiredPermissions) {
    return (req, res, next) => {
        const user = req.user; // Assuming user is set in the request by a previous middleware

        if (!user || !user.role) {
            return res.status(403).json({message: "Access denied. No user role found."});
        }

        const permissions = ROLE_PERMISSIONS[user.role] || [];

        const hasPermission = requiredPermissions.every(permission =>
            permissions.includes(permission)
        );

        if (!hasPermission) {
            return res.status(403).json({message: "Access denied. Insufficient permissions."});
        }

        next();
    };
}
module.exports = authorize;
