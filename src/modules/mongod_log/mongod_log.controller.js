const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const service = require("./mongod_log.service");

const analyzeLogData = async (req, res, next) => {
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
        msg: "excel to save",
        resultsTotal: resultsTotal || [],
        percentages: msgNsPercentages,
      });
    }

    return res.json({ status: false, message: "No data found" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Hàm tạo mô tả mới từ thông tin bảng và trường tìm kiếm
const generateDescription = (table, field) => {
  return `tìm kiếm '${table}' theo '${field}'`;
};

const writeToExcel = (resultsTotal) => {
  // Tạo một workbook mới
  const wb = XLSX.utils.book_new();

  // Tạo dữ liệu cho worksheet
  const wsData = [["Bảng", "Câu truy vấn", "Tỉ lệ %", "Mô tả"]];

  // Tạo một mảng tạm thời để lưu trữ dữ liệu cần sắp xếp
  const tempData = [];

  // Chuyển đổi dữ liệu từ resultsTotal vào định dạng mong muốn
  for (const [table, queries] of Object.entries(resultsTotal)) {
    for (const [queryType, attributes] of Object.entries(queries)) {
      attributes.forEach((attr) => {
        const attrParts = attr.attr.split(":");
        const field = attrParts[0].split(".").pop().trim(); // Lấy trường tìm kiếm, ví dụ 'customerCif'
        const percentage = parseFloat(attrParts[1].trim());
        const formattedPercentage = percentage; // Định dạng phần trăm
        // const formattedPercentage = formatPercentage(percentage); // Định dạng phần trăm

        // Thay thế mô tả bằng chuỗi mới
        const description = generateDescription(table, field);

        // Thêm dữ liệu vào mảng tạm
        tempData.push([
          table,
          queryType,
          percentage,
          formattedPercentage,
          description,
        ]);
      });
    }
  }

  // Sắp xếp theo phần trăm từ cao đến thấp
  tempData.sort((a, b) => b[2] - a[2]);

  // Đẩy dữ liệu đã sắp xếp vào wsData, bỏ cột percentage gốc (đã được định dạng)
  tempData.forEach((row) => {
    wsData.push([row[0], row[1], row[3], row[4]]);
  });

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
  analyzeLogData,
};
