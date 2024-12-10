const {
  createSprint,
  createCategory,
  createTask,
} = require("./import.service");

const importJsonTaskCategorySprint = async (req, res, next) => {
  try {
    const { data, projectId, personCharge, nameProject } = req.body;
    if (!data) {
      return res.json({ success: false, message: "No data provided" });
    }

    let sprint = {};
    let categoryLevel1 = null;
    let categoryLevel2 = null;
    let categoryLevel3 = null;
    let result = [];

    // let CORE_BASE = `${req.protocol}://${req.headers.host}`;
    let CORE_BASE = "https://administrator.lifetek.vn:250"; //

    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "No Authorization header provided" });
    }
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Invalid Authorization header format" });
    }
    for (const element of data) {
      if (!element.hasOwnProperty("Column1")) {
        element.Column1 = ""; // Thêm trường Column1 nếu chưa tồn tại
      }
      if (element.startDate || element.endDate) {
        element.startDate = convertDate(element.startDate);
        element.endDate = convertDate(element.endDate);
      }

      // Xử lý itemCategory = sprint
      if (element.itemCategory === "sprint") {
        categoryLevel1 = null;
        categoryLevel2 = null;
        categoryLevel3 = null;
        sprint = element.name;

        // tạo mới sprint ::
        const response = await createSprint(
          projectId,
          element.name,
          personCharge,
          element.startDate,
          element.endDate,
          token,
          CORE_BASE
        );
        sprint = response;
        console.log("sprint ", sprint.name);
      }

      if (element.itemCategory === "categoryLevel1") {
        if (categoryLevel1) {
          categoryLevel1 = null;
        }
        categoryLevel1 = element.name;

        // tạo mới hạng mục ::
        const response = await createCategory(
          projectId,
          element.name,
          element.startDate,
          element.endDate,
          element.numberDay,
          null,
          token,
          CORE_BASE
        );
        categoryLevel1 = response._id;
      }

      if (element.itemCategory === "categoryLevel2") {
        if (categoryLevel2) {
          categoryLevel2 = null;
        }
        categoryLevel2 = element.name;
        // tạo mới hạng mục :: với cha là categoryLevel1
        const response = await createCategory(
          projectId,
          element.name,
          element.startDate,
          element.endDate,
          element.numberDay,
          categoryLevel1,
          token,
          CORE_BASE
        );
        categoryLevel2 = response._id;
      }

      if (element.itemCategory === "categoryLevel3") {
        if (categoryLevel3) {
          categoryLevel3 = null;
        }
        categoryLevel3 = element.name;
        // tạo mới hạng mục :: với cha là categoryLevel2 cha categoryLevel1
        const response = await createCategory(
          projectId,
          element.name,
          element.startDate,
          element.endDate,
          element.numberDay,
          categoryLevel2,
          token,
          CORE_BASE
        );
        categoryLevel3 = response._id;
      }

      // Xử lý task
      if (element.itemCategory === "task") {
        // tại mới task với id currentLv cao nhất nếu có
        let categoryId;
        if (categoryLevel3) {
          categoryId = categoryLevel3;
        } else if (categoryLevel2) {
          categoryId = categoryLevel2;
        } else if (categoryLevel1) {
          categoryId = categoryLevel1;
        }
        const response = await createTask(
          nameProject,
          token,
          CORE_BASE,
          categoryId,
          projectId,
          sprint._id,
          element.name,
          formatToISO(element.startDate),
          formatToISO(element.endDate)
        );

        result.push({
          // task: element.name,
          // startDate: element.startDate,
          // endDate: element.endDate,
          // sprint: sprint._id,
          // categoryLevel3,
          // categoryLevel2,
          // categoryLevel1,
          task: response,
        });
      }
    }

    function convertDate(dateStr) {
      // Split the input date string by "/"
      const [day, month, year] = dateStr.split("/");

      // Rearrange the parts to "yyyy/MM/dd" format
      return `${year}/${month}/${day}`;
    }

    function formatToISO(dateStr) {
      // Split the date string (yyyy/MM/dd) into parts
      const [year, month, day] = dateStr.split("/");

      // Create a new Date object (Month is 0-indexed in JavaScript)
      const date = new Date(Date.UTC(year, month - 1, day));

      // Return the ISO string
      return date.toISOString();
    }

    return res.json({ success: true, count: result.length });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

module.exports = {
  importJsonTaskCategorySprint,
};
