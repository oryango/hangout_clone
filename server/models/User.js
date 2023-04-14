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
  phoneNumber: {
    type: String, default: "",
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
  const userUpdateList = []
  for await (const user of users){
    const name = senderName === user.name ? sendeeName : senderName
    const userDocument = await this.findOne({_id: user.userId})

    const query = {
      chatId: _id,
      type: "direct",
      name: name
    }

    userDocument.conversationList.push(query)

    await userDocument.save();

    userUpdateList.push({userId: user.userId, query,})
  }
  return userUpdateList

};

UserSchema.statics.updateUsersGroup = async function updateUsersGroup(data) {
  const { name, room, io } = data
  const { _id, users } = room
  const userUpdateList = []

  for await (const user of users){
    const userDocument = await this.findOne({_id: user.userId})
    const query = {
      chatId: _id,
      type: "group",
      name: name
    }
    userDocument.conversationList.push(query)

    await userDocument.save();
    userUpdateList.push({userId: user.userId, query,})
  }
  return userUpdateList


};

UserSchema.statics.updateUserSMS = async function updateUserSMS(data) {
  const { room } = data
  const { _id, users, destinationNumber } = room
  const userUpdateList = []

  for await (const user of users){
    const userDocument = await this.findOne({_id: user.userId})

    const query = {
      chatId: _id,
      type: "sms",
      name: destinationNumber
    }

    userDocument.conversationList.push(query)

    await userDocument.save();

    userUpdateList.push({userId: user.userId, query,})
  }
  return userUpdateList

}

UserSchema.statics.requestPhone = async function requestPhone(data) {
  const {userId} = data

  const userDocument = await this.findOne({_id: userId})
  userDocument.phoneNumber = "requested"
  userDocument.save()
}

module.exports = mongoose.model('users', UserSchema);