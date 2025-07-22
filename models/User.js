const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLES } = require("../utils/roles.js");

const userSchema = new mongoose.Schema({
    
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/.+@.+\..+/, "Please enter a valid email address"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 6 characters long"],
            select: false, // Exclude password from queries by default
        },
        role:{
            type: String,
            enum:Object.values(ROLES),
            required: [true, "Role is required"]
            
        },
        
        region: {
            type: String,
            required: function() {
                return this.role === ROLES.REGIONAL_ADMIN;
            },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
        {timestamps: true}

);

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error("Password comparison failed"); //remove on prod
    };

};

module.exports = mongoose.model("User", userSchema);


