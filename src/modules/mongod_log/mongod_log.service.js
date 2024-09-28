const mongod_log = require("./mongod_log.model");
const {
  createPipelineMsgCounts,
  createPipelineNsCounts,
  createPipelineStatistics,
  createPipelineResults,
  createPipelineResultsTotal,
} = require("./mognod_log.pipeline");

const finData = async (req) => {
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

    // Lấy dữ liệu theo filter
    const data = await mongod_log.mongodLogModel
      .find(filter, "_id")
      .skip(skip)
      .limit(limit)
      .exec();

    if (data.length > 0) {
      return {
        status: true,
        data: data || [],
      };
    }
    return { message: "No data found" };
  } catch (error) {
    console.error("Error in finData:", error);
    return { status: false, error: error.message };
  }
};
/**
 * Hàm tính toán tổng số lượng bản ghi và phần trăm từ các điều kiện lọc trong log.
 *
 * @param {Object} msgNsPercentages - Đối tượng chứa các tỉ lệ phần trăm theo message và namespace.
 * @returns {Object} - Đối tượng chứa kết quả tổng hợp với thông tin về số lượng và phần trăm của các trường lọc.
 */
const resultsTotal = async (msgNsPercentages) => {
  try {
    // Đếm tổng số bản ghi trong bộ sưu tập mongodLog
    const totalRecords = await mongod_log.mongodLogModel.countDocuments();
    const totalResult = {}; // Đối tượng để lưu trữ kết quả tổng hợp

    // Duyệt qua từng namespace trong msgNsPercentages
    for (const ns in msgNsPercentages.nsPercentages) {
      totalResult[ns] = {}; // Khởi tạo đối tượng cho từng namespace

      // Duyệt qua từng message trong msgPercentages
      for (const msg in msgNsPercentages.msgPercentages) {
        // Tạo pipeline cho việc truy vấn
        const pipeline = createPipelineResultsTotal(msg, ns);
        // Thực hiện truy vấn aggregate theo pipeline
        const results = await mongod_log.mongodLogModel.aggregate(pipeline);
        console.log("🚀 ~ resultsTotal ~ results:", results)
        // Lấy kết quả đầu tiên nếu có, nếu không thì khởi tạo giá trị mặc định
        const response =
          results.length > 0
            ? results[0]
            : { totalRecords: 0, filterFields: {} };
        const formattedResult = []; // Mảng để lưu trữ kết quả đã định dạng

        // Hàm để tính phần trăm trên tổng số bản ghi
        const percentageOnTotalRecords = (count) =>
          ((count / totalRecords) * 100).toFixed(6);

        // Kiểm tra nếu filterFields tồn tại và là một đối tượng
        if (
          response.filterFields &&
          typeof response.filterFields === "object"
        ) {
          // Duyệt qua từng trường trong filterFields
          for (const [key, value] of Object.entries(response.filterFields)) {
            if (value !== undefined && value !== null) {
              // Định dạng chi tiết cho trường lọc
              const detailedFilter = formatFilterField(key, value);

              if (detailedFilter) {
                // Định dạng kết quả theo yêu cầu
                formattedResult.push({
                  attr: `${key} : ${percentageOnTotalRecords(value.count)}%`, // Tạo chuỗi hiển thị phần trăm
                  value, // Dữ liệu trong $or hoặc $and
                });
              }
            }
          }
        }

        // Nếu có kết quả đã định dạng, lưu vào totalResult
        if (formattedResult.length > 0) {
          totalResult[ns][msg] = formattedResult;
        }
      }
    }

    // Trả về kết quả tổng hợp
    return totalResult;
  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi
    console.error("Error in resultsTotal:", error);
    return { status: false, error: error.message };
  }
};

// Hàm để duyệt qua tất cả các trường và phần tử của $and, $or và hiển thị toàn bộ
const formatFilterField = (key, value) => {
  if (value === undefined || value === null) {
    return null; // Bỏ qua nếu giá trị không hợp lệ
  }

  if (typeof value === "object" && value !== null) {
    // Kiểm tra và xử lý các điều kiện $and và $or
    if (value.$and) {
      return `$and: [${value.$and
        .map((condition) =>
          formatFilterField(
            Object.keys(condition)[0],
            condition[Object.keys(condition)[0]]
          )
        )
        .join(", ")}]`;
    } else if (value.$or) {
      return `$or: [${value.$or
        .map((condition) =>
          formatFilterField(
            Object.keys(condition)[0],
            condition[Object.keys(condition)[0]]
          )
        )
        .join(", ")}]`;
    } else {
      // Nếu là một trường thông thường
      return `${key}: ${JSON.stringify(value)}`;
    }
  } else {
    // Nếu giá trị là đơn giản (string, number, v.v.)
    return `${key}: ${value}`;
  }
};

const resultsQuery = async (req) => {
  try {
    const { ns, msg } = req.query;

    const results = await mongod_log.mongodLogModel.aggregate(
      createPipelineResults(msg, ns)
    );
    const count = await mongod_log.mongodLogModel.countDocuments();

    const response =
      results.length > 0
        ? results[0]
        : { totalCodes: 0, totalRecords: 0, percentage: 0 };

    const percentageOnTotalRecords = (response.totalCodes / count) * 100;

    return {
      msg: `kết quả của ${msg} từ ${ns} có filter.code là : ${
        response.totalCodes
      } chiến: ${percentageOnTotalRecords.toFixed(
        2
      )}% trong tổng số ${count} bản ghi`,
      // results_response: response,
      percentageOnTotalRecords: {
        formattedTotalRecords_vi: `${percentageOnTotalRecords.toFixed(2)} %`,
        totalRecordsPercentage: percentageOnTotalRecords,
        totalCodes: response.totalCodes,
        totalRecords: count,
      },
    };
  } catch (error) {
    console.error("Error in finData:", error);
    return { status: false, error: error.message };
  }
};
const msgNsPercentages = async (req) => {
  try {
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

    const msgPercentages = msgCounts.reduce((acc, item) => {
      acc[`${item.msg}`] = `${item.percentage.toFixed(2)}%`;
      return acc;
    }, {});

    return {
      msgPercentages,
      nsPercentages,
    };
  } catch (error) {
    console.error("Error in finData:", error);
    return { status: false, error: error.message };
  }
};
const statistics = async (req) => {
  try {
    // Lấy thông tin về các loại lệnh và collection duy nhất
    const uniqueInfo = await mongod_log.mongodLogModel
      .aggregate(createPipelineStatistics())
      .exec();

    // Đếm số lượng bản ghi cho commandTypes
    const commanTypes = await mongod_log.mongodLogModel.countDocuments({
      "attr.type": req.query.commandTypes || 0,
    });

    return {
      statistics: {
        ...uniqueInfo[0],
        commanTypes,
      },
    };
  } catch (error) {
    console.error("Error in finData:", error);
    return { status: false, error: error.message };
  }
};

module.exports = {
  finData,
  resultsTotal,
  resultsQuery,
  msgNsPercentages,
  statistics,
};
