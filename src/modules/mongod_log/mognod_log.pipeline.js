const createPipelineNsCounts = (totalRecords) => {
  try {
    return [
      {
        $group: {
          _id: "$attr.ns",
          count: { $sum: 1 },
          codes: {
            $push: {
              $cond: [
                { $ifNull: ["$attr.command.filter.code", false] },
                "$attr.command.filter.code",
                null,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          ns: "$_id",
          count: 1,
          codes: {
            $filter: {
              input: "$codes",
              as: "code",
              cond: { $ne: ["$$code", null] },
            },
          },
          percentage: {
            $multiply: [
              { $divide: ["$count", { $literal: totalRecords }] },
              100,
            ],
          },
        },
      },
    ];
  } catch (error) {
    console.log("error.createPipelineNsCounts", error.message);
    return [];
  }
};
const createPipelineMsgCounts = (totalRecords) => {
  try {
    return [
      {
        $group: {
          _id: "$msg",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          msg: "$_id",
          count: 1,
          percentage: {
            $multiply: [{ $divide: ["$count", totalRecords] }, 100],
          },
        },
      },
    ];
  } catch (error) {
    console.log("error.createPipelineMsgCounts", error.message);
    return [];
  }
};
const createPipelineStatistics = () => {
  try {
    return [
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
    ];
  } catch (error) {
    console.log("error.createPipelineStatistics", error.message);
    return [];
  }
};
const createPipelineResults = (msg, ns) => {
  try {
    return [
      {
        $match: {
          msg: msg,
          "attr.ns": ns,
        },
      },
      {
        $project: {
          _id: 1,
          code: { $ifNull: ["$attr.command.filter.code", null] }, // Lấy code từ filter, nếu không có thì trả về null
        },
      },
      {
        $group: {
          _id: null, // Nhóm tất cả các kết quả
          totalCodes: { $sum: { $cond: [{ $ne: ["$code", null] }, 1, 0] } }, // Đếm số lượng code không null
          totalRecords: { $sum: 1 }, // Đếm tổng số bản ghi
        },
      },
      {
        $project: {
          _id: 0,
          totalCodes: 1,
          totalRecords: 1,
          percentage: {
            $cond: {
              if: { $gt: ["$totalRecords", 0] }, // Kiểm tra nếu tổng số bản ghi lớn hơn 0
              then: {
                $multiply: [{ $divide: ["$totalCodes", "$totalRecords"] }, 100],
              }, // Tính tỷ lệ phần trăm
              else: 0, // Nếu không, tỷ lệ là 0
            },
          },
        },
      },
    ];
  } catch (error) {
    console.log("error.createPipelineStatistics", error.message);
    return [];
  }
};
const createPipelineResultsTotal = (msg, ns) => {
  try {
    return [
      {
        $match: {
          msg: msg,
          "attr.ns": ns,
        },
      },
      {
        $project: {
          _id: 1,
          code: { $ifNull: ["$attr.command.filter.code", null] }, // Lấy code từ filter, nếu không có thì trả về null
          name: { $ifNull: ["$attr.command.filter.name", null] }, // Lấy name từ filter, nếu không có thì trả về null
        },
      },
      {
        $group: {
          _id: null, // Nhóm tất cả các kết quả
          totalCodes: { $sum: { $cond: [{ $ne: ["$code", null] }, 1, 0] } }, // Đếm số lượng code không null
          totalNames: { $sum: { $cond: [{ $ne: ["$name", null] }, 1, 0] } }, // Đếm số lượng name không null
          totalRecords: { $sum: 1 }, // Đếm tổng số bản ghi
        },
      },
      {
        $project: {
          _id: 0,
          totalCodes: 1,
          totalNames: 1,
          totalRecords: 1,
          percentage: {
            $cond: {
              if: { $gt: ["$totalRecords", 0] }, // Kiểm tra nếu tổng số bản ghi lớn hơn 0
              then: {
                $multiply: [{ $divide: ["$totalCodes", "$totalRecords"] }, 100],
              }, // Tính tỷ lệ phần trăm cho code
              else: 0, // Nếu không, tỷ lệ là 0
            },
          },
        },
      },
    ];
  } catch (error) {
    console.log("error.createPipelineStatistics", error.message);
    return [];
  }
};

module.exports = {
  createPipelineNsCounts,
  createPipelineMsgCounts,
  createPipelineStatistics,
  createPipelineResults,
  createPipelineResultsTotal,
};
