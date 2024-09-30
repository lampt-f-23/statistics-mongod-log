
const service = require("./mongod_log.service");
const xlsx = require("xlsx");
const fs = require("fs");

const get_data = async (req, res, next) => {
  try {
    const [msgNsPercentages] = await Promise.all([service.msgNsPercentages(req)]);

    if (msgNsPercentages) {
      const resultsTotal = await service.resultsTotal(msgNsPercentages);

      // Ghi dữ liệu vào file Excel
      if (resultsTotal) {
        const filePath = './resultsTotal.xlsx'; // Đường dẫn file Excel

        // Chuyển đổi dữ liệu resultsTotal thành một mảng các đối tượng để ghi vào Excel
        const sheetData = [];
        for (let key in resultsTotal) {
          if (resultsTotal[key]["Slow query"]) {
            resultsTotal[key]["Slow query"].forEach((query) => {
              sheetData.push({
                collection: key,
                attr: query.attr,
                data: JSON.stringify(query.value.data),  // Biến đổi dữ liệu thành chuỗi
                count: query.value.count,
                percentage: query.value.percentage
              });
            });
          }
        }

        // Tạo một bảng tính (sheet) từ dữ liệu
        const worksheet = xlsx.utils.json_to_sheet(sheetData);

        // Tạo một workbook và thêm bảng tính vào
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Results");

        // Ghi workbook vào file Excel
        xlsx.writeFile(workbook, filePath);

        // Gửi phản hồi với dữ liệu JSON và đường dẫn tới file Excel
        return res.json({
          message: "Data saved to Excel",
          resultsTotal: resultsTotal || [],
          percentages: msgNsPercentages,
          filePath: filePath,
        });
      }
    }

    return res.json({ status: false, message: "No data found" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

module.exports = {
  get_data,
};

// const service = require("./mongod_log.service");

// const get_data = async (req, res, next) => {
//   try {
//     // const [data, resultsQuery, msgNsPercentages, statistics] =
//     //   await Promise.all([
//     //     service.finData(req),
//     //     service.resultsQuery(req),
//     //     service.msgNsPercentages(req),
//     //     service.statistics(req),
//     //   ]);
//     const [msgNsPercentages] = await Promise.all([
//       service.msgNsPercentages(req),
//     ]);

//     if (msgNsPercentages) {
//       const resultsTotal = await service.resultsTotal(msgNsPercentages);

//       return res.json({
//         resultsTotal: resultsTotal || [],
//         // resultsQuery: resultsQuery || {},
//         percentages: msgNsPercentages,
//         // statistics,
//         // data: data,
//       });
//     }

//     return res.json({ status: false, message: "No data found" });
//   } catch (error) {
//     return res.json({ success: false, message: error.message });
//   }
// };

// module.exports = {
//   get_data,
// };
