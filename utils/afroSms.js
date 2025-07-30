const axios = require("axios");
const logger = require("./logger");

const sendOTP = async (phone) => {
  try {
    // const response = await axios.get(
    //   "https://api.afromessage.com/api/challenge",
    //   {
    //     params: {
    //       from: process.env.AFROMESSAGE_IDENTFIER_ID || "",
    //       sender: process.env.AFROMESSAGE_SENDER_ID || "AfroMessage",
    //       to: phone,
    //       pr: "Your verification code is: {code}",
    //       sb: 1,
    //       sa: 0,
    //       ttl: 300,
    //       len: 6,
    //       t: 0,
    //       callback: "",
    //     },
    //     headers: {
    //       Authorization: `Bearer ${process.env.AFROMESSAGE_API_TOKEN}`,
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );

    // if (response.data.acknowledge !== "success") {
    //   throw new Error(
    //     `AfroMessage error: ${response.data.response.errors || "Unknown error"}`
    //   );
    // }

    // logger.info(`OTP sent to ${phone}: ${response.data.response.message}`);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationID = `${phone}-${code}`;
    logger.info(`Mock OTP sent to ${phone}: ${code}`);
    const response = {
      data: {
        response: {
          verificationId: verificationID,
          code: code,
        },
      },
    };

    logger.info(`Status: ${response.data.response.verificationId}`);

    return {
      verificationID: response.data.response.verificationId,
      code: response.data.response.code,
    };
  } catch (err) {
    logger.error(`AfroMessage sendOTP error: ${err || err.message}`);
    throw new Error(`Failed to send OTP: ${err}`);
  }
};

const verifyOTP = async (phone, verificationId, code) => {
  try {
    // const response = await axios.get("https://api.afromessage.com/api/verify", {
    //   params: {
    //     to: phone,
    //     vs: verificationId,
    //     code,
    //   },
    //   headers: {
    //     Authorization: `Bearer ${process.env.AFROMESSAGE_API_TOKEN}`,
    //     "Content-Type": "application/json",
    //   },
    // });

    // if (response.data.acknowledge !== "success") {
    //   throw new Error(
    //     `AfroMessage verify error: ${
    //       response.data.response?.message || "Invalid OTP"
    //     } `
    //   );
    // }
    if (!verificationId || !code) {
      throw new Error("Missing verificationId or code");
    }
    // Mock verification: extract code from verificationId for testing
    const expectedCode = verificationId.split("-")[0] === phone ? code : null;
    if (!expectedCode) {
      throw new Error("Invalid verification ID or code");
    }

    logger.info(`OTP verified for ${phone}`);
    return true;
  } catch (err) {
    logger.error(
      `AfroMessage verifyOTP error: ${
        err.response?.data?.response?.message || err.message
      }`
    );
    return false;
  }
};

module.exports = { sendOTP, verifyOTP };
