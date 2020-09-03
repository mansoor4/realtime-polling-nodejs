const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VoteSchema = new Schema({
  title:{
    type:String,
  },
  question:{
    type:String,
  },
  choice:[{
    opt:String,
    vote:{
      type:Number,
      default:0
    }
  }]

});
// add a object in choice
// {
//   opt,vote,id_unique
// }

// Create collection and add schema
const Vote = mongoose.model("Vote", VoteSchema);

module.exports = Vote;
