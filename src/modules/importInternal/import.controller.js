const { createSprint, createCategory } = require("./import.service");

const run = async (req, res, next) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.json({ success: false, message: "No data provided" });
    }

    let sprint = {};
    let categoryLevel1 = null;
    let categoryLevel2 = null;
    let categoryLevel3 = null;
    let result = [];
    let CORE_BASE = "https://administrator.lifetek.vn:250"; //
    let projectId = "6756718d0bad4b7476d46ab4"; //
    let personCharge = "665d161e6603465907b4185b"; //
    let nameProject = "tung2"; //
    let token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNjA0OTlmZTljMDRiZTc0YjhiZWFjOGVmIiwiaWF0IjoxNzMzNzQxMDUwLCJleHAiOjE3NDU3NDEwNTB9.3kQ4SjNbWG5BJB5fNZGGmepp2GrZravWO6mbKnGUicE"; //

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
        //console.log("sprint ", sprint.name);
      }

      if (element.itemCategory === "categoryLevel1") {
        if (categoryLevel1) {
          categoryLevel1 = null;
        }
        categoryLevel1 = element.name;

        // tạo mới hạng mục ::
        // const response = await createCategory(
        //   projectId,
        //   element.name,
        //   element.startDate,
        //   element.endDate,
        //   element.numberDay,
        //   null,
        //   token,
        //   CORE_BASE
        // );
        // categoryLevel1 = response._id;
      }

      if (element.itemCategory === "categoryLevel2") {
        if (categoryLevel2) {
          categoryLevel2 = null;
        }
        categoryLevel2 = element.name;
        // tạo mới hạng mục :: với cha là categoryLevel1
        // const response = await createCategory(
        //   projectId,
        //   element.name,
        //   element.startDate,
        //   element.endDate,
        //   element.numberDay,
        //   categoryLevel1,
        //   token,
        //   CORE_BASE
        // );
        // categoryLevel2 = response._id;
      }

      if (element.itemCategory === "categoryLevel3") {
        if (categoryLevel3) {
          categoryLevel3 = null;
        }
        categoryLevel3 = element.name;
        // tạo mới hạng mục :: với cha là categoryLevel2 cha categoryLevel1
        // const response = await createCategory(
        //   projectId,
        //   element.name,
        //   element.startDate,
        //   element.endDate,
        //   element.numberDay,
        //   categoryLevel2,
        //   token,
        //   CORE_BASE
        // );
        // categoryLevel3 = response._id;
      }

      // Xử lý task
      if (element.itemCategory === "task") {
        // tại mới task với id currentLv cao nhất nếu có
        result.push({
          task: element.name,
          startDate: element.startDate,
          endDate: element.endDate,
          sprint: sprint._id,
          categoryLevel3,
          categoryLevel2,
          categoryLevel1,
        });
      }
    }

    function convertDate(dateStr) {
      // Split the input date string by "/"
      const [day, month, year] = dateStr.split("/");

      // Rearrange the parts to "yyyy/MM/dd" format
      return `${year}/${month}/${day}`;
    }

    return res.json({ success: true, message: result });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

module.exports = {
  run,
};
