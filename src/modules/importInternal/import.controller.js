const run = async (req, res, next) => {
  const { data } = req.body;
  if (!data) {
    return res.json({ success: false });
  }

  const processedData = await Promise.all(
    data.map(async (element) => {
      if (!element.hasOwnProperty("Column1")) {
        element.Column1 = "";
      }
      if (element.itemCategory === "sprint") {
        console.log(element.name);
      }
      if (element.itemCategory === "category_parent") {
        console.log(element.name);
      }

      return element;
    })
  );

  return res.json({ success: true, message: data });
};

module.exports = {
  run,
};
