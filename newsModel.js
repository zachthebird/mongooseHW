var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var newsSchema = new Schema({
  title: String,
  link: String
});

var News = mongoose.model('News', newsSchema);

module.exports = News;