const axios = require("axios");

const https = require("https");

const createSprint = async (
  projectId,
  name,
  personCharge,
  startDate,
  endDate,
  tokenBearer,
  coreBase
) => {
  try {
    const url = `${coreBase}/api/projects`;
    const token = tokenBearer; // Bearer token

    // Dữ liệu gửi đi
    const data = {
      itemCategory: "Sprint", // cứng với sprint
      projectId: projectId, // nhập tay id project
      name: name, // công việc excel
      nameSprint: name, // sprint
      personCharge: personCharge, // nhập tay người phụ trách
      progress: 0,
      kanbanStatus: "",
      startDate: startDate, // từ ngày excel
      endDate: endDate, // đến ngày excel
      finishDate: "",
      fileResult: "",
      parentId: projectId, // nhập tay id project
      path: projectId, // nhập tay id project
    };

    // Cấu hình Header
    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // Thêm token vào Header
        "Content-Type": "application/json", // Định dạng JSON
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false, // Bỏ qua xác minh SSL
      }),
    };

    // Gửi yêu cầu POST
    const response = await axios.post(url, data, config);

    if (response.data.status === 1) {
      //console.log("OK == Response data:", response.data.data); // Log kết quả trả về
      return response.data.data;
    }
    return false;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message); // Log lỗi
    throw error;
  }
};
const createTask = async (
  nameProject,
  tokenBearer,
  coreBase,
  categoryId,
  projectId,
  sprintId,
  name,
  startDate,
  endDate
) => {
  try {
    const url = `${coreBase}/api/tasks`;
    const token = tokenBearer; // Bearer token

    // Dữ liệu gửi đi
    const data = {
      nameProject: nameProject,
      projectId: projectId,
      projectCategoryId: categoryId,
      itemCategory: "Task",
      sprintId: sprintId,
      name: name,
      startDate: startDate,
      endDate: endDate,
      taskStatus: 1,
      priority: 3,
      inCharge: [],
      taskManager: [],
      progress: 0,
      join: [],
      resultDocuments: [],
      support: [],
      kanbanStatus: 1,
      finishDate: null,
      relatedDocument: [],
      taskResult: [],
      assessmentResult: [],
      finalDate: "",
      periodProject: null,
      isObligatory: true,
    };
    //console.log("🚀 ~ data:", data);

    // Cấu hình Header
    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // Thêm token vào Header
        "Content-Type": "application/json", // Định dạng JSON
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false, // Bỏ qua xác minh SSL
      }),
    };

    // Gửi yêu cầu POST
    const response = await axios.post(url, data, config);

    if (response.data.success == true) {
      console.log("OK == Response data:", response.data); // Log kết quả trả về
      // console.log("OK"); // Log kết quả trả về
      return response.data.data;
    }
    return false;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message); // Log lỗi
    throw error;
  }
};
const createCategory = async (
  projectId,
  name,
  startDate,
  endDate,
  numberDay,
  categoryPath,
  tokenBearer,
  coreBase
) => {
  try {
    const url = `${coreBase}/api/projects`;
    const token = tokenBearer; // Bearer token
    var path = projectId;
    var parentId = projectId;
    if (categoryPath != null) {
      path = `${projectId}/${categoryPath}`;
      parentId = categoryPath;
    }
    // if (categoryPath.path) {
    //   path = `${categoryPath.path}`;
    // }
    // Dữ liệu gửi đi
    const data = {
      code: "",
      itemCategory: "Category", // fix cứng
      projectCategory: true,
      projectId: projectId,
      name: name, // name có trong excel
      personCharge: null,
      progress: 0,
      kanbanStatus: "",
      finishDate: endDate, //   có trong excel
      fileResult: "",
      parentId: parentId,
      startDate: startDate, //   có trong excel
      endDate: null,
      duration: numberDay,
      path: path,
    };
    //console.log("🚀 ~ data:", data);

    // Cấu hình Header
    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // Thêm token vào Header
        "Content-Type": "application/json", // Định dạng JSON
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false, // Bỏ qua xác minh SSL
      }),
    };

    // Gửi yêu cầu POST
    const response = await axios.post(url, data, config);

    if (response.data.status === 1) {
      //console.log("OK == Response data:", response.data); // Log kết quả trả về
      // console.log("OK"); // Log kết quả trả về
      return response.data.data;
    }
    return false;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message); // Log lỗi
    throw error;
  }
};

// // sprint
// let sprintObj = {
//   // response lấy _id
//   itemCategory: "Sprint", //  cứng với sprint
//   projectId: projectId, // nhập tay id project 1
//   name: "Các dịch vụ thông tin", // công việc excel
//   nameSprint: "sprint 3", // sprint
//   personCharge: "665d161e6603465907b4185b", // nhập tay người phụ trách;
//   progress: 0,
//   kanbanStatus: "",
//   startDate: "2025/01/18", // tu ngày excel
//   endDate: "2025/02/20", // den ngày excel
//   finishDate: "",
//   fileResult: "",
//   parentId: projectId, // nhập tay id project 1
//   path: projectId, // nhập tay id project 1
// };

// let categoryObj = {
//   // response lấy _id, path
//   itemCategory: "Category", // fix cứng
//   projectCategory: true,
//   projectId: projectId, // nhập tay id project 1
//   name: "CÁC PHẦN MỀM VẬN HÀNH (02 phần mềm)", // name có trong excel
//   personCharge: null,
//   progress: 0,
//   kanbanStatus: "",
//   finishDate: "2025/01/06", //   có trong excel
//   fileResult: "",
//   parentId: "6756718d0bad4b7476d46ab4", // nhập tay id project 1
//   startDate: "2024/12/23", //   có trong excel
//   endDate: null,
//   duration: 13,
//   path: projectId, // nhập tay id project 1
//   path: `${projectId}/6757aba40bad4b7476d46bec`, // nếu có category cha con
// };
// let taskObj = {
//   nameProject: nameProject,
//   projectId: projectId,
//   projectCategoryId: "6757ac710bad4b7476d46bf5", // lấy từ categoryLevel cao nhất
//   itemCategory: "Task", // fix cứng
//   sprintId: "675671c30bad4b7476d46abf", // lấy từ sprint id
//   name: "Quản lý danh sách người dùng vận hành nền tảng", // name có trong excel
//   startDate: "2024-12-22T17:00:00.000Z", // có trong excel
//   endDate: "2024-12-23T10:44:00.000Z", // có trong excel
//   taskStatus: 1,
//   priority: 3,
//   inCharge: [],
//   taskManager: [],
//   progress: 0,
//   join: [],
//   resultDocuments: [],
//   support: [],
//   kanbanStatus: 1,
//   finishDate: null,
//   relatedDocument: [],
//   taskResult: [],
//   assessmentResult: [],
//   finalDate: "",
//   periodProject: null,
//   isObligatory: true,
// };

function hasSlash(str) {
  return str.includes("/");
}

module.exports = {
  createSprint,
  createCategory,
  createTask,
};
