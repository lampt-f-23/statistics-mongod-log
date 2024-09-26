const service = require("./mongod_log.service");

const get_data = async (req, res, next) => {
  try {
    const data = await service.find_data(req);
    if (data.status) {
      res.json({
        success: true,
        data: data,
      });
    }
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  get_data,
};
