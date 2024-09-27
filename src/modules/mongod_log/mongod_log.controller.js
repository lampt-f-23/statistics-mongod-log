const service = require("./mongod_log.service");

const get_data = async (req, res, next) => {
  try {
    const [data, resultsQuery, msgNsPercentages, statistics] =
      await Promise.all([
        service.finData(req),
        service.resultsQuery(req),
        service.msgNsPercentages(req),
        service.statistics(req),
      ]);

    if (msgNsPercentages) {
      const resultsTotal = await service.resultsTotal(msgNsPercentages);

      return res.json({
        resultsTotal: resultsTotal || [],
        resultsQuery: resultsQuery || {},
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
