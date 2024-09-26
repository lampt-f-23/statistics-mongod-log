const service = require("./mongod_log.service");

const get_data = async (req, res, next) => {
  try {
    const data = await service.find_data(req);
    if (data.status) {
      return res.json({
        data: data,
      });
    }
    return res.json({
      status: false,
      message: "No data found",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  get_data,
};
