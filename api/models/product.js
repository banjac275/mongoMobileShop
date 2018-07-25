const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String },
  manufacturer: { type: String, required: true },
  released: { type: String },
  //picture: req.body.picture,
  numInStock: { type: Number, required: true }
});

module.exports = mongoose.model('Product', productSchema);