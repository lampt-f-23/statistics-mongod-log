const service = require("./mongod_log.service");

const get_data = async (req, res, next) => {
  try {
    const data = await service.finData(req);

    const results = await service.results(req);

    const msgNsPercentages = await service.msgNsPercentages(req);

    const statistics = await service.statistics(req);

    if (msgNsPercentages) {
      return res.json({
        results,
        percentages: msgNsPercentages,
        statistics,
        data: data,
      });
    }

    return res.json({ status: false, message: "No data found" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

module.exports = {
  get_data,
};
