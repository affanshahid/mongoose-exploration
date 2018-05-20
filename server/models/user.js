const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { pick } = require('lodash');
const { isEmail } = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    trim: true
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

userSchema.methods.generateAuthToken = async function () {
  const access = 'auth';
  const token = jwt.sign({ _id: this._id.toHexString(), access }, 'abc123').toString();

  this.tokens.push({ token, access });
  await this.save();
  return token;
};

userSchema.methods.toJSON = function () {
  return pick(this.toObject(), ['email', '_id']);
};

userSchema.methods.removeToken = function (token) {
  return this.update({
    $pull: {
      tokens: { token }
    }
  });
};

userSchema.statics.findByToken = function (token) {
  let decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch (err) {
    return Promise.reject();
  }

  return this.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
};

userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email });

  if (!user) throw new Error('User not found');
  await new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (err, success) => {
      if (err || !success) return reject(err);
      resolve();
    });
  });

  return user;
};

userSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    bcrypt.hash(this.password, 10, (err, hashedPassword) => {
      if (err) return next(err);
      this.password = hashedPassword;
      next();
    });
  } else next();
});

const User = mongoose.model('User', userSchema);

module.exports = { User };