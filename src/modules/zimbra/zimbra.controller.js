const axios = require("axios");
const https = require("https");

const zimbraTokenToUser = async (req, res, next) => {
  const { ssoToken, ssoHost, zimbraToken } = req.body;
  try {
    if (!ssoHost || !zimbraToken) {
      return res.status(400).json({
        success: false,
        message: "các trường ssoHost và zimbraToken không được để trống",
      });
    }

    let data = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">\r\n  
                <soap:Header>\r\n    
                  <context xmlns="urn:zimbra">\r\n     
                    <authToken>${zimbraToken}</authToken>\r\n
                  </context>\r\n  
                </soap:Header>\r\n  
                <soap:Body>\r\n    
                  <GetInfoRequest xmlns="urn:zimbraAccount"/>\r\n  
                </soap:Body>\r\n
              </soap:Envelope>\r\n`;

    const config = {
      headers: {
        "Content-Type": "application/xml",
        cookie: `ZM_AUTH_TOKEN=${ssoToken}`,
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      maxBodyLength: Infinity,
    };

    const response = await axios.post(ssoHost, data, config);
    try {
      if (response.status === 200) {
        const index1 = response.data.indexOf("<name>");
        const index2 = response.data.indexOf("</name>");
        const name = response.data.slice(index1 + 6, index2);
        const atIndex = name.indexOf("@");
        const username = name.slice(0, atIndex);

        return res.json({
          success: true,
          username: username,
        });
      }
    } catch (error) {
      console.log(1);
      return res.json({
        success: false,
        error: error.message,
      });
    }
  } catch (error) {
    console.log(2);
    return res.json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  zimbraTokenToUser,
};
