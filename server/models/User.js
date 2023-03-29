const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const conversationSchema = new Schema({
  chatId: {
    type: mongoose.ObjectId, required: true
  },
  name: {
    type: String, required: true
  },
  type: {
    type: String, required: true
  },
});

const UserSchema =  new Schema({
  email: {
    // Trim and lowercase
    type: String, required: true, index: { unique: true }, lowercase: true, trim: true,
  },
  password: {
    type: String, required: true, trim: true,
  },
  firstName: {
    type: String, trim: true,
  },
  lastName: {
    type: String, trim: true,
  },
  conversationList: [conversationSchema],
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

  if(user.$isNew){
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
	const user = await this.findOne({email}).exec();
  try {
    if(await bcrypt.compare(password, user.password)) {
      return user;
    } else {
      return null;
    }
  } catch {
    return null;
  }

};

UserSchema.statics.updateUsersDirect = async function updateUsersDirect(data) {
  const { room, senderName, sendeeName } = data
  const { _id, users } = room
  for await (const user of users){
    const name = senderName === user.name ? sendeeName : senderName
    const userDocument = await this.findOne({_id: user.userId})
    console.log(userDocument)

    userDocument.conversationList.push({
      chatId: _id,
      type: "direct",
      name: name
    })

    await userDocument.save();

    console.log(userDocument) 

  }

};

UserSchema.statics.updateUsersGroup = async function updateUsersGroup(data) {
  const { name, room } = data
  const { _id, users } = room

  for await (const user of users){
    const userDocument = await this.findOne({_id: user.userId})
    console.log(userDocument)

    userDocument.conversationList.push({
      chatId: _id,
      type: "direct",
      name: name
    })

    await userDocument.save();

    console.log(userDocument) 

  }


};

module.exports = mongoose.model('users', UserSchema);