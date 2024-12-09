const axios = require("axios");

const run = async (req, res, next) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.json({ success: false });
    }
    const processedData = await Promise.all(
      data.map(async (element) => {
        if (!element.hasOwnProperty("Column1")) {
          element.Column1 = "";
        }

        //
        
        if (element.itemCategory === "sprint") {
          console.log(`Sprint : ${element.name}`);
        }
        if (element.itemCategory === "categoryLevel1") {
          console.log(`categoryLevel1 : ${element.name}`);
        }
        if (element.itemCategory === "categoryLevel2") {
          console.log(`categoryLevel2 : ${element.name}`);
        }
        if (element.itemCategory === "categoryLevel3") {
          console.log(`categoryLevel3 : ${element.name}`);
        }
        if (element.itemCategory === "task") {
          console.log(`task : ${element.name}`);
        }

        return element;
      })
    );

    return res.json({ success: true, message: data });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

module.exports = {
  run,
};
