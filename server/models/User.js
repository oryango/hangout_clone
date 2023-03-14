const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');


const UserSchema =  new Schema({
  email: {
    // Trim and lowercase
    type: String, required: true, index: { unique: true }, lowercase: true, trim: true,
  },
  password: {
    type: String, required: true, trim: true,
  },
});

async function generateHash(password) {
  const COST = 12;
  return bcrypt.hash(password, COST);
}

UserSchema.pre('save', function preSave(next) {
  const user = this;

  // Only create a new password hash if the field was updated
  if(user.isModified('password')) {
    return generateHash(user.password).then(hash => {
      user.password = hash;
      return next();
    }).catch(error => {
      return next(error);
    });
  }
  return next();
});

UserSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


UserSchema.statics.verify = async function verify({email, password}) {
	return await this.findOne({email, password}).exec();
};

module.exports = mongoose.model('users', UserSchema);