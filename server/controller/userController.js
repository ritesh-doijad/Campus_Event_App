const bcrypt = require('bcrypt');
const userModel = require('../models/user');
const eventModel = require('../models/event');
const { generateToken } = require('../utils/generateToken');
const crypto = require('crypto');
const { sendVerificationEmail, sendWelcomeEmail } = require('../config/email-verification');
const { Knock }  = require("@knocklabs/node")
const knock = new Knock(process.env.KNOCK_API_KEY);


const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const getUserDetails = async (req, res, next) => {
    try {
        const { userid } = req.params;
        let user = await userModel.findById(userid);
        if (!user) {
            return res.status(404).json({ status: "Error", response: "User not found" });
        }
        return res.status(200).json({
            status: "success",
            response: user
        });
    } catch (err) {
        next(err);
    }
};

const getUsersByName = async (req, res, next) => {
    try {
        const { search } = req.body;

        // Create a query object to filter users by role
        let query = {
            role: { $in: ['admin', 'user'] }  // Only fetch users with roles "admin" or "user"
        };

        // If search parameter is present, look for users by first name or last name
        if (search) {
            query.$or = [
                { firstname: { $regex: search, $options: 'i' } },  // Case-insensitive search by first name
                { lastname: { $regex: search, $options: 'i' } },   // Case-insensitive search by last name
                { email: { $regex: search, $options: 'i' } }        // Optional: Case-insensitive search by email
            ];
        }

        // Find users based on the constructed query
        const users = await userModel.find(query, 'firstname lastname email branch yearOfStudy');

        if (users.length === 0) {
            return res.status(404).json({ status: "Error", response: "No users found" });
        }

        return res.status(200).json({
            status: "success",
            response: users
        });
    } catch (err) {
        next(err);
    }
};

const getUserByBranch = async (req, res, next) => {
    try {
        // Find users based on the constructed query
        const users = await userModel.find({branch:'CSE'}, 'firstname lastname email role image yearOfStudy');

        if (users.length === 0) {
            return res.status(404).json({ status: "Error", response: "No users found" });
        }

        return res.status(200).json({
            status: "success",
            response: users
        });
    } catch (err) {
        next(err);
    }
};

const getParticipants = async (req, res, next) => {
    try {
        const { search } = req.body;
        const { eventId } = req.params;

        // Find the event by its ID and populate the participants
        const event = await eventModel.findById(eventId).populate('participants', 'firstname lastname email branch yearOfStudy');

        if (!event) {
            return res.status(404).json({ status: "Error", response: "Event not found" });
        }

        // Create a query object to filter participants by name
        let query = {
            _id: { $in: event.participants.map(participant => participant.userId) }  // Only fetch users who are participants in the event
        };

        // If search parameter is present, look for participants by first name or last name
        if (search) {
            query.$or = [
                { firstname: { $regex: search, $options: 'i' } },  // Case-insensitive search by first name
                { lastname: { $regex: search, $options: 'i' } }   // Case-insensitive search by last name
            ];
        }

        // Find the participants based on the query
        const participants = await userModel.find(query, 'firstname lastname email branch yearOfStudy');

        return res.status(200).json({
            status: "success",
            response: participants
        });
    } catch (err) {
        next(err);
    }
};

const getAllParticipants = async (req, res, next) => {
    try {
        const { eventId } = req.params;

        // Find the event by its ID and populate the participants
        const event = await eventModel.findById(eventId).populate({
            path: 'participants.userId',
            select: 'firstname lastname email branch yearOfStudy' // Select only required fields
        });

        if (!event) {
            return res.status(404).json({ status: "Error", response: "Event not found" });
        }

        // Map the participants to include only the necessary details
        const participants = event.participants.map(participant => ({
            firstname: participant.userId.firstname,
            userId: participant.userId._id,
            lastname: participant.userId.lastname,
            email: participant.userId.email,
            branch: participant.userId.branch,
            yearOfStudy: participant.userId.yearOfStudy
        }));

        return res.status(200).json({
            status: "success",
            response: participants
        });
    } catch (err) {
        next(err);
    }
};


const registerUser = async (req, res, next) => {
    try {
        const {
            firstname,
            lastname,
            email,
            password,
            branch,
            yearOfStudy,
            interests,
            myevents,
            contact
        } = req.body;

        // Check if required fields are present
        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({ status: "Error", response: "All fields are required" });
        }

        // Check if user exists
        let user = await userModel.findOne({ email });

        // If the user exists and is not verified
        if (user && !user.isVerified) {
            // Check if the verification token has expired
            if (Date.now() > user.tokenExpiry) {
                // Generate a new token and send a new verification email
                user.verificationToken = generateVerificationToken();
                user.tokenExpiry = Date.now() + 3600000; // 1 hour expiry
                await user.save();

                // Resend the verification email
               await sendVerificationEmail(user, user.verificationToken);
                return res.status(200).json({ status: "Success", response: "A new verification email has been sent" });
            } else {
                return res.status(400).json({ status: "Error", response: "Please check your email for the verification link" });
            }
        }

        // If the user is already verified
        if (user) {
            return res.status(403).json({ status: "Error", response: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Plain text password:", password);
        console.log("Hashed password:", hashedPassword);

        // Create new user
        let createdUser = await userModel.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            branch,
            yearOfStudy,
            interests,
            myevents,
            contact,
            isVerified: false, // Mark as unverified initially
            verificationToken: generateVerificationToken(),
            tokenExpiry: Date.now() + 3600000, // 1 hour expiry
        });

        await knock.users.identify(
            createdUser._id.toString(), {
            name: firstname + ' ' + lastname,
            email,
        });

        await createdUser.save();

        // Send verification email
      await  sendVerificationEmail(createdUser, createdUser.verificationToken);

    //   await sendWelcomeEmail(createdUser);
        res.status(200).json({ status: "Success", response: 'User registered. Please verify your email.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "Error", response: "An internal server error occurred" });
    }
};


const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        let user = await userModel.findOne({ email });
        if (!user) {
            return res.status(403).json({ status: "Error", response: "Email or Password Incorrect" });
        }

        console.log("Stored password:", user.password);

        if (!user.isVerified) {
            // Check if the verification token has expired
            if (Date.now() > user.tokenExpiry) {
                // Generate a new token and send a new verification email
                user.verificationToken = generateVerificationToken();
                user.tokenExpiry = Date.now() + 3600000; // 1 hour expiry
                await user.save();

             await  sendVerificationEmail(user, user.verificationToken);
                return res.status(400).json({ status: "Error", response: "Verification token expired. A new verification email has been sent" });
            }

            return res.status(400).json({ status: "Error", response: 'Email not verified' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(403).json({ status: "Error", response: "Email or Password Incorrect" });
        }

        const token = generateToken(user);
        res.cookie("token", token);

        await knock.users.identify(user._id.toString(), {
            name: user.firstname + ' ' + user.lastname,
            email: user.email,
        });

        // await knock.objects.addSubscriptions("all-event-notification", "alleventnotification1234", {
        //     recipients: [user._id.toString()],
        //     properties: {
        //       // Optionally set other properties on the subscription for each recipient
        //     },
        //   });

        await sendWelcomeEmail(user)

        return res.status(200).json({
            status: "Success",
            response: { user, token }
        });
    } catch (err) {
        next(err);
    }
};

const resendVerificationEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ status: "Error", response: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ status: "Error", response: "User is already verified" });
        }

        // Generate a new token and resend the verification email
        user.verificationToken = generateVerificationToken();
        user.tokenExpiry = Date.now() + 3600000; // 1 hour expiry
        await user.save();

       await sendVerificationEmail(user, user.verificationToken);
        res.status(200).json({ status: "Success", response: "Verification email resent" });
    } catch (err) {
        next(err);
    }
};

const googleLogin = async (req, res, next) => {
    try {
        const { email, firstname, lastname, image } = req.body;

        // Find user by email in the database
        const user = await userModel.findOne({ email });

        if (user) {
            // Ensure user is marked as verified if logging in with Google
            if (!user.isVerified) {
                user.isVerified = true;
                await user.save();
            }

            const token = generateToken(user);
            res.cookie("token", token);
            const { password, ...userData } = user._doc; // Exclude password when sending user data
            return res.status(200).json({
                status: "Success",
                response: { user: userData, token },
            });
        } else {
            // If the user doesn't exist, create a new one with isVerified: true
            const newUser = new userModel({
                firstname,
                lastname,
                email,
                password: null, // No password for Google login
                image,
                branch: '',
                yearOfStudy: '',
                interests: [],
                contact: '',
                isVerified: true, // Google users are automatically verified
            });

            await newUser.save();

            // Identify the user with Knock (optional)
            await knock.users.identify(newUser._id.toString(), {
                name: `${firstname} ${lastname}`,
                email,
            });

            // Send a welcome email
            await sendWelcomeEmail(newUser);

            const token = generateToken(newUser);
            res.cookie("token", token);
            const { password, ...userData } = newUser._doc; // Exclude password when sending user data
            return res.status(201).json({
                user: userData,
                token,
            });
        }
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware
    }
};



const updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        const user = await userModel.findByIdAndUpdate(userId, { role }, { new: true });
        if (!user) {
            return res.status(403).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "User role updated", user });
    } catch (err) {
        return res.status(403).json({ message: "Error updating user role", error: err.message });
    }
};
const userUpdate = async (req, res, next) => {
    try {
        let {
            firstname,
            lastname,
            email,
            password,
            branch,
            yearOfStudy,
            interests,
            role,
            myevents,
            image,
            contact
        } = req.body;

        // Find the existing user
        let existingUser = await userModel.findById(req.params.id);
        if (!existingUser) {
            return res.status(404).json({ status: "Error", response: "User not found" });
        }

        // Prevent superadmin from updating branch
        if (existingUser.role === "superadmin" && branch) {
            return res.status(403).json({ status: "Error", response: "Superadmin cannot update branch" });
        }

        // Prepare updated data
        let updatedData = {
            firstname: firstname || existingUser.firstname,
            lastname: lastname || existingUser.lastname,
            email: email || existingUser.email,
            yearOfStudy: yearOfStudy || existingUser.yearOfStudy,
            interests: interests || existingUser.interests,
            role: role || existingUser.role,
            image: image || existingUser.image,  // Ensure image is updated
            myevents: myevents || existingUser.myevents,
            contact: contact || existingUser.contact
        };

        // Hash password only if it's provided
        if (password) {
            updatedData.password = await bcrypt.hash(password, 10);
        }

        // Only update branch if the user is not a superadmin
        if (existingUser.role !== "superadmin") {
            updatedData.branch = branch || existingUser.branch;
        }

        // Update user in the database
        let updatedUser = await userModel.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        return res.status(200).json({
            status: "success",
            response: updatedUser  // Send updated user back to frontend
        });
    } catch (err) {
        next(err);
    }
};

const addOrganisedEvent = async (req, res) => {
    const { userId, eventId } = req.body;
    try {
        await userModel.findByIdAndUpdate(userId, { $push: { eventsorganised: eventId } });
        res.status(200).json({ message: "Event added to user's organised events" });
    } catch (err) {
        res.status(403).json({ message: "Failed to update user's organised events", error: err });
    }
};


const addMyEvent = async (req, res) => {
    const { userId, eventId, paymentImage } = req.body;
    console.log(req.body);

    try {
        await userModel.findByIdAndUpdate(userId, { $push: { myevents: { eventId: eventId, paymentScreenshot: paymentImage } } });
        res.status(200).json({ message: "Event added to user's events" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update user's events", error: err });
    }
};


const deleteUser = async (req, res) => {
    try {
        let user = await userModel.findOneAndDelete({ _id: req.query.id });
        res.status(200).json({
            status: "success",
            response: `User deleted`
        });
    } catch (err) {
        res.status(403).json({ status: "Error", response: err.message });
    }
};


module.exports = { getAllParticipants,getParticipants,getUsersByName, getUserDetails, registerUser, loginUser, googleLogin, updateUserRole, userUpdate, addOrganisedEvent, deleteUser, resendVerificationEmail, addMyEvent,getUserByBranch }