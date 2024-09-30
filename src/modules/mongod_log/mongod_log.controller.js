const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const service = require("./mongod_log.service");

const get_data = async (req, res, next) => {
  try {
    const [msgNsPercentages] = await Promise.all([
      service.msgNsPercentages(req),
    ]);

    if (msgNsPercentages) {
      const resultsTotal = await service.resultsTotal(msgNsPercentages);

      // Ghi dữ liệu vào file Excel
      writeToExcel(resultsTotal);

      // Gửi response JSON như bình thường
      return res.json({
        msg: 'excel to save',
        resultsTotal: resultsTotal || [],
        percentages: msgNsPercentages,
      });
    }

    return res.json({ status: false, message: "No data found" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const writeToExcel = (resultsTotal) => {
  // Tạo một workbook mới
  const wb = XLSX.utils.book_new();

  // Tạo dữ liệu cho worksheet
  const wsData = [["Bảng", "Câu truy vấn", "Tỉ lệ %", "Mô tả"]];

  // Chuyển đổi dữ liệu từ resultsTotal vào định dạng mong muốn
  for (const [table, queries] of Object.entries(resultsTotal)) {
    for (const [queryType, attributes] of Object.entries(queries)) {
      attributes.forEach((attr) => {
        const attrParts = attr.attr.split(":");
        const percentage = parseFloat(attrParts[1].trim());
        const description = `${attrParts[0].trim()}: ${JSON.stringify(
          attr.value.data
        )}`;

        wsData.push([table, queryType, percentage, description]);
      });
    }
  }

  // Tạo một worksheet từ dữ liệu
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Thiết lập độ rộng cột
  ws["!cols"] = [
    { wch: 20 }, // Bảng
    { wch: 15 }, // Câu truy vấn
    { wch: 10 }, // Tỉ lệ %
    { wch: 50 }, // Mô tả
  ];

  // Thêm worksheet vào workbook
  XLSX.utils.book_append_sheet(wb, ws, "Data");

  // Xác định đường dẫn để lưu file
  const fileName = `data_${Date.now()}.xlsx`;
  const filePath = path.join(__dirname, "exports", fileName);

  // Đảm bảo thư mục 'exports' tồn tại
  if (!fs.existsSync(path.join(__dirname, "exports"))) {
    fs.mkdirSync(path.join(__dirname, "exports"));
  }

  // Ghi workbook vào file
  XLSX.writeFile(wb, filePath);

  console.log(`File Excel đã được lưu tại: ${filePath}`);
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
