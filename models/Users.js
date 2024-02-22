const mongoose = require("mongoose");


const userSchema = mongoose.Schema(
  {
    address: {type: String},
    duplicate: {type: String},
    allocation: {type: Number, default: 0},
    limit: {type: Number}
  },
  { timestamps: true }
);


userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("User", userSchema);
