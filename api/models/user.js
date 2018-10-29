const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: { type: String, required: true, unique: true, match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ },
    password: { type: String, required: false },
    mobile: { type: Number, required: true },
    firstname: { type: String, required: false },
    lastname: { type: String, required: false },
    businessid: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: false },
    businessname: { type: String, required: false },
    businessaddress: { type: String, required: false },    
    status: { type: Number, required: false },
    usergroup: { type: String, required: false },
    latitude: { type: String, required: false },
    longitude: { type: String, required: false },
    location: []    
});

module.exports = mongoose.model('User', userSchema);