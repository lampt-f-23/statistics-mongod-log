const service = require("./mongod_log.service");

const get_data = async (req, res, next) => {
  try {
    const [data, results, msgNsPercentages, statistics] = await Promise.all([
      service.finData(req),
      service.results(req),
      service.msgNsPercentages(req),
      service.statistics(req),
    ]);

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
