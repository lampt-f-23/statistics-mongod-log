const mongod_log = require("./mongod_log.model");
const {
  createPipelineMsgCounts,
  createPipelineNsCounts,
  createPipelineStatistics,
  createPipelineResults,
} = require("./mognod_log.pipeline");

const find_data = async (req) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { commandTypes, ns, s, c, ctx, msg } = req.query;
    const filter = {
      ...(commandTypes && { "attr.type": commandTypes }),
      ...(ns && { "attr.ns": ns }),
      ...(s && { s: s }),
      ...(c && { c: c }),
      ...(ctx && { ctx: ctx }),
      ...(msg && { msg: msg }),
    };

    // lấy tổng số bản ghi
    const totalRecords = await mongod_log.mongodLogModel.countDocuments();
    //  lấy dữ liệu msg ns theo pipeline
    const [msgCounts, nsCounts] = await Promise.all([
      mongod_log.mongodLogModel
        .aggregate(createPipelineMsgCounts(totalRecords))
        .exec(),
      mongod_log.mongodLogModel
        .aggregate(createPipelineNsCounts(totalRecords))
        .exec(),
    ]);

    // format kết quả thành định dạng { "a = 80.3% , codes: 123", "b = 19.7% , codes: 0" }
    const nsPercentages = nsCounts.reduce((acc, item) => {
      const percentage = item.percentage.toFixed(2);
      let codeInfo = "";

      if (item.codes.length > 0) {
        codeInfo = `codes: ${item.codes.length}`;
      } else {
        codeInfo = "codes: 0";
      }
      acc[item.ns] = `${percentage}% , ${codeInfo}`;
      return acc;
    }, {});

    // format kết quả thành định dạng { "a = 80.3%", "b = 19.7%" }
    const msgPercentages = msgCounts.reduce((acc, item) => {
      acc[`${item.msg}`] = `${item.percentage.toFixed(2)}%`;
      return acc;
    }, {});

    // Lấy dữ liệu theo filter
    const data = await mongod_log.mongodLogModel
      .find(filter, "_id")
      .skip(skip)
      .limit(limit)
      .exec();

    // Lấy thông tin về các loại lệnh và collection duy nhất
    const uniqueInfo = await mongod_log.mongodLogModel
      .aggregate(createPipelineStatistics())
      .exec();

    // Đếm số lượng bản ghi cho commandTypes
    const commanTypes = await mongod_log.mongodLogModel.countDocuments({
      "attr.type": req.query.commandTypes || 0,
    });

    const results = await mongod_log.mongodLogModel.aggregate(
      createPipelineResults(msg, ns)
    );
    // Kết quả
    const response =
      results.length > 0
        ? results[0]
        : { totalCodes: 0, totalRecords: 0, percentage: 0 };

    if (uniqueInfo.length > 0) {
      return {
        status: true,
        results: `kết quả của ${msg} từ ${ns} là : tổng: ${
          response.totalRecords
        } có code: ${response.totalCodes} chiến: ${response.percentage.toFixed(
          2
        )}%`,

        msgPercentages,
        nsPercentages,
        statistics: {
          ...uniqueInfo[0],
          commanTypes,
        },
        data: data || [],
      };
    }
    return { status: false, message: "No data found" };
  } catch (error) {
    console.error("Error in find_data:", error);
    return { status: false, error: error.message };
  }
};

module.exports = {
  find_data,
};
