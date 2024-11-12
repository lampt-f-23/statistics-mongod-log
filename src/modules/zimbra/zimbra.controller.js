const zimbraTokenToUser = async (req, res, next) => {
  try {
    return res.json({
      msg: "ok",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

module.exports = {
  zimbraTokenToUser,
};
