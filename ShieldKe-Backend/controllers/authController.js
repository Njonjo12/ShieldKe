const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/*
========================================
REGISTER USER
========================================
*/

const registerUser = async (req, res) => {

  try {

    const {
      name,
      email,
      phone,
      password,
      role,
      specialization,
      yearsOfExperience,
      consultationFee,
      lskNumber,
      location,
      bio
    } = req.body;

    /*
    ========================================
    CHECK IF USER EXISTS
    ========================================
    */

    const existingUser = await User.findOne({ email });

    if (existingUser) {

      // Lawyer trying to reapply

      if (
        existingUser.role === "lawyer" &&
        existingUser.verificationStatus === "rejected"
      ) {

        if (!existingUser.canReapply) {

          return res.status(403).json({
            message:
              "Your application was rejected. Please address admin feedback before reapplying.",
            rejectionReason:
              existingUser.rejectionReason
          });

        }

      } else {

        return res.status(400).json({
          message: "User already exists"
        });

      }

    }

    /*
    ========================================
    HASH PASSWORD
    ========================================
    */

    const hashedPassword = await bcrypt.hash(password, 10);

    /*
    ========================================
    HANDLE FILES
    ========================================
    */

    let barCertificate = "";
    let practicingCertificate = "";
    let nationalIdDocument = "";
    let profilePhoto = "";

    if (req.files) {

      if (req.files.barCertificate) {

        barCertificate =
          req.files.barCertificate[0].path;

      }

      if (req.files.practicingCertificate) {

        practicingCertificate =
          req.files.practicingCertificate[0].path;

      }

      if (req.files.nationalIdDocument) {

        nationalIdDocument =
          req.files.nationalIdDocument[0].path;

      }

      if (req.files.profilePhoto) {

        profilePhoto =
          req.files.profilePhoto[0].path;

      }

    }

    /*
    ========================================
    UPDATE REJECTED LAWYER REAPPLICATION
    ========================================
    */

    if (
      existingUser &&
      existingUser.role === "lawyer"
    ) {

      existingUser.name = name;
      existingUser.phone = phone;
      existingUser.password = hashedPassword;

      existingUser.specialization =
        specialization;

      existingUser.yearsOfExperience =
        yearsOfExperience;

      existingUser.consultationFee =
        consultationFee;

      existingUser.lskNumber =
        lskNumber;

      existingUser.location =
        location;

      existingUser.bio =
        bio;

      existingUser.barCertificate =
        barCertificate;

      existingUser.practicingCertificate =
        practicingCertificate;

      existingUser.nationalIdDocument =
        nationalIdDocument;

      existingUser.profilePhoto =
        profilePhoto;

      existingUser.verificationStatus =
        "pending";

      existingUser.isVerified = false;

      existingUser.rejectionReason = "";

      await existingUser.save();

      return res.status(200).json({
        message:
          "Application resubmitted successfully"
      });

    }

    /*
    ========================================
    CREATE USER
    ========================================
    */

    const user = await User.create({

      name,
      email,
      phone,
      password: hashedPassword,
      role,

      specialization,
      yearsOfExperience,
      consultationFee,
      lskNumber,
      location,
      bio,

      barCertificate,
      practicingCertificate,
      nationalIdDocument,
      profilePhoto,

      verificationStatus:
        role === "lawyer"
          ? "pending"
          : "verified",

      isVerified:
        role === "client"
    });

    res.status(201).json({

      message: "Account created successfully",

      user: {

        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus:
          user.verificationStatus,
        isVerified:
          user.isVerified,
        rejectionReason:
          user.rejectionReason,
        canReapply:
          user.canReapply,
        profilePhoto:
          user.profilePhoto
      }

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};


/*
========================================
LOGIN USER
========================================
*/

const loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {

      return res.status(401).json({
        message: "Invalid credentials"
      });

    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {

      return res.status(401).json({
        message: "Invalid credentials"
      });

    }

    const token = jwt.sign({

      id: user._id,
      role: user.role

    },

    process.env.JWT_SECRET,

    {
      expiresIn: "7d"
    });

    res.json({

      token,

      user: {

        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,

        verificationStatus:
          user.verificationStatus,

        isVerified:
          user.isVerified,

        rejectionReason:
          user.rejectionReason,

        canReapply:
          user.canReapply,

        specialization:
          user.specialization,

        yearsOfExperience:
          user.yearsOfExperience,

        consultationFee:
          user.consultationFee,

        lskNumber:
          user.lskNumber,

        location:
          user.location,

        bio:
          user.bio,

        profilePhoto:
          user.profilePhoto
      }

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};


/*
========================================
GET CURRENT USER
========================================
*/

const getMe = async (req, res) => {

  res.json(req.user);

};

module.exports = {
  registerUser,
  loginUser,
  getMe
};