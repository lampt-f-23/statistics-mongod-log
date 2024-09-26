const mongod_log = require("./mongod_log.model");

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

    console.log("filter", filter);
    console.log("req.query", req.query);

    // Lấy dữ liệu theo filter
    const data = await mongod_log.mongodLogModel
      .find(filter, "_id")
      .skip(skip)
      .limit(limit)
      .exec();

    // Lấy thông tin về các loại lệnh và collection duy nhất
    const uniqueInfo = await mongod_log.mongodLogModel
      .aggregate([
        {
          $group: {
            _id: null,
            commandTypes: { $addToSet: "$attr.type" },
            totalCount: { $sum: 1 },
            s: { $addToSet: "$s" },
            c: { $addToSet: "$c" },
            ctx: { $addToSet: "$ctx" },
            msg: { $addToSet: "$msg" },
            uniqueCollections: { $addToSet: "$attr.ns" },
            planSummaries: { $addToSet: "$attr.planSummary" },
            protocols: { $addToSet: "$attr.protocol" },
          },
        },
        {
          $project: {
            _id: 0,
            commandTypes: 1,
            totalCount: 1,
            s: 1,
            c: 1,
            ctx: 1,
            msg: 1,
            uniqueCollections: 1,
            planSummaries: 1,
            protocols: 1,
          },
        },
      ])
      .exec();

    // Đếm số lượng bản ghi cho commandTypes 
    const commanTypes = await mongod_log.mongodLogModel.countDocuments({
      "attr.type": req.query.commandTypes || 0,
    });

    if (uniqueInfo.length > 0) {
      return {
        status: true,
        statistics: {
          ...uniqueInfo[0],
          commanTypes,
        },
        data,
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
