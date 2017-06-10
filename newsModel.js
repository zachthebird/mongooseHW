var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var newsSchema = new Schema({
  title: String,
  link: String,
  comment: {
      type: Schema.Types.ObjectId,
      ref: "Comments"
  }
});

var News = mongoose.model('News', newsSchema);

module.exports = News;