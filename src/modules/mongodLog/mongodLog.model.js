var db = require("../../config/db");

const mongodLogShema = new db.mongoose.Schema(
  {
    name: { type: String },
  },
  {
    collection: "mongo_logs3",
  }
);
let mongodLogModel = db.mongoose.model("mongod_log_model", mongodLogShema);

module.exports = { mongodLogModel };
