var mongoose = require("mongoose"),
  bcrypt = require("bcrypt"),
  validator = require("validator"),
  jwt = require("jsonwebtoken");
JWT_SECRET = process.env.JWT_SECRET;

var profile = {
  // Basic info
  name: {
    type: String,
    min: 1,
    max: 100
  },

  adult: {
    type: Boolean,
    required: true,
    default: false
  },

  school: {
    type: String,
    min: 1,
    max: 150
  },

  educationLevel: {
    type: String,
    enum: {
      values: ["H", "U", "G"]
    }
  },

  year: {
    type: String,
    enum: {
      values: ["1", "2", "3", "4", "5"]
    }
  },

  hackathonsAttended: {
    type: String,
    enum: {
      values: ["0", "1", "3", "6"]
    }
  },

  description: {
    type: String,
    min: 0,
    max: 500
  },

  virtualOpinions: {
    type: String,
    min: 0,
    max: 3000
  },

  learningGoals: {
    type: String,
    min: 0,
    max: 3000
  },

  passions: {
    type: String,
    min: 0,
    max: 3000
  },

  hasTeam: {
    type: String,
    enum: {
      values: ["yes", "no"]
    }
  },

  teamFormationPlan: {
    type: String,
    enum: {
      values: ["yes", "no"]
    }
  },
  specialAccomodations: {
    type: String,
    min: 1,
    max: 1000
  },

  // Temporarily hiding since 2021 is virtual
  // dietaryRestrictions: {
  //   type: String,
  //   min: 0,
  //   max: 300
  // },

  activityInterests: {
    type: [String]
  },

  otheractivityInterests: {
    type: String,
    min: 0,
    max: 1000
  },

  heardAboutUs: {
    type: [String]
  },

  otherHeardAboutUs: {
    type: String,
    min: 0,
    max: 1000
  },

  timezone: {
    type: String,
    min: 0,
    max: 1000
  },

  misc: {
    type: String,
    min: 0,
    max: 1000
  },

  // Optional info for demographics
  gender: {
    type: String,
    enum: {
      values: ["M", "F", "O", "N"]
    }
  },

  ethnicity: {
    type: [String]
  },

  major: {
    type: String,
    min: 0,
    max: 100
  },

  minor: {
    type: String,
    min: 0,
    max: 100
  },

  resume: {
    type: String,
    min: 0,
    max: 500
  },

  shirtSize: {
    type: String,
    enum: {
      values: ["XS", "S", "M", "L", "XL", "XXL"]
    }
  }
};

// Only after confirmed
var confirmation = {
  phoneNumber: String,
  // dietaryRestrictions: [String],
  // otherDietaryRestrictions: String,

  github: String,
  linkedin: String,
  website: String,

  signatureLiability: String,
  signaturePhotoRelease: String,
  signatureCodeOfConduct: String,

  notes: String
};

var status = {
  /**
   * Whether or not the user's profile has been completed.
   * @type {Object}
   */
  completedProfile: {
    type: Boolean,
    required: true,
    default: false
  },
  admitted: {
    type: Boolean,
    required: true,
    default: false
  },
  admittedBy: {
    type: String,
    validate: [validator.isEmail, "Invalid Email"],
    select: false
  },
  confirmed: {
    type: Boolean,
    required: true,
    default: false
  },
  declined: {
    type: Boolean,
    required: true,
    default: false
  },
  checkedIn: {
    type: Boolean,
    required: true,
    default: false
  },
  checkInTime: {
    type: Number
  },
  confirmBy: {
    type: Number
  },
  reimbursementGiven: {
    type: Boolean,
    default: false
  }
};

// define the schema for our admin model
var schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "Invalid Email"]
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  admin: {
    type: Boolean,
    required: true,
    default: false
  },

  timestamp: {
    type: Number,
    required: true,
    default: Date.now()
  },

  lastUpdated: {
    type: Number,
    default: Date.now()
  },

  teamCode: {
    type: String,
    min: 0,
    max: 140
  },

  verified: {
    type: Boolean,
    required: true,
    default: false
  },

  salt: {
    type: Number,
    required: true,
    default: Date.now(),
    select: false
  },

  /**
   * User Profile.
   *
   * This is the only part of the user that the user can edit.
   *
   * Profile validation will exist here.
   */
  profile: profile,

  /**
   * Confirmation information
   *
   * Extension of the user model, but can only be edited after acceptance.
   */
  confirmation: confirmation,

  status: status
});

schema.set("toJSON", {
  virtuals: true
});

schema.set("toObject", {
  virtuals: true
});

//=========================================
// Instance Methods
//=========================================

// checking if this password matches
schema.methods.checkPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

// Token stuff
schema.methods.generateEmailVerificationToken = function() {
  return jwt.sign(this.email, JWT_SECRET);
};

schema.methods.generateAuthToken = function() {
  return jwt.sign(this._id.toString(), JWT_SECRET);
};

/**
 * Generate a temporary authentication token (for changing passwords)
 * @return JWT
 * payload: {
 *   id: userId
 *   iat: issued at ms
 *   exp: expiration ms
 * }
 */
schema.methods.generateTempAuthToken = function() {
  return jwt.sign(
    {
      id: this._id
    },
    JWT_SECRET,
    {
      expiresInMinutes: 60
    }
  );
};

//=========================================
// Static Methods
//=========================================

schema.statics.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

/**
 * Verify an an email verification token.
 * @param  {[type]}   token token
 * @param  {Function} cb    args(err, email)
 */
schema.statics.verifyEmailVerificationToken = function(token, callback) {
  jwt.verify(token, JWT_SECRET, function(err, email) {
    return callback(err, email);
  });
};

/**
 * Verify a temporary authentication token.
 * @param  {[type]}   token    temporary auth token
 * @param  {Function} callback args(err, id)
 */
schema.statics.verifyTempAuthToken = function(token, callback) {
  jwt.verify(token, JWT_SECRET, function(err, payload) {
    if (err || !payload) {
      return callback(err);
    }

    if (!payload.exp || Date.now() >= payload.exp * 1000) {
      return callback({
        message: "Token has expired."
      });
    }

    return callback(null, payload.id.toString());
  });
};

schema.statics.findOneByEmail = function(email) {
  return this.findOne({
    email: email.toLowerCase()
  });
};

/**
 * Get a single user using a signed token.
 * @param  {String}   token    User's authentication token.
 * @param  {Function} callback args(err, user)
 */
schema.statics.getByToken = function(token, callback) {
  jwt.verify(
    token,
    JWT_SECRET,
    function(err, id) {
      if (err) {
        return callback(err);
      }
      this.findOne({ _id: id }, callback);
    }.bind(this)
  );
};

schema.statics.validateProfile = function(profile, cb) {
  return cb(
    !(
      profile.name.length > 0 &&
      profile.school.length > 0 &&
      profile.major.length > 0 &&
      ["H", "U", "G"].indexOf(profile.educationLevel) > -1 &&
      ["1", "2", "3", "4", "5"].indexOf(profile.year) > -1 &&
      profile.timezone.length > 0 &&
      ["XS", "S", "M", "L", "XL", "XXL"].indexOf(profile.shirtSize) > -1 &&
      ["0", "1", "3", "6"].indexOf(profile.hackathonsAttended) > -1 &&
      profile.learningGoals.length > 0 &&
      profile.passions.length > 0 &&
      ["yes", "no"].indexOf(profile.hasTeam) > -1 &&
      ["yes", "no"].indexOf(profile.teamFormationPlan) > -1 &&
      profile.heardAboutUs.length > 0 &&
      profile.activityInterests.length > 0
    )
  );
};

//=========================================
// Virtuals
//=========================================

/**
 * Has the user completed their profile?
 * This provides a verbose explanation of their furthest state.
 */
schema.virtual("status.name").get(function() {
  if (this.status.checkedIn) {
    return "checked in";
  }

  if (this.status.declined) {
    return "declined";
  }

  if (this.status.confirmed) {
    return "confirmed";
  }

  if (this.status.admitted) {
    return "admitted";
  }

  if (this.status.completedProfile) {
    return "submitted";
  }

  if (!this.verified) {
    return "unverified";
  }

  return "incomplete";
});

module.exports = mongoose.model("User", schema);
