// logger.js
const logger = (req, res, next) => {
  const start = Date.now();

  // Capture original send function
  const originalSend = res.send;

  res.send = function (body) {
    // Log the API details
    console.log("=======================================");
    console.log(" API Hit:", req.method, req.originalUrl);
    console.log(" Request Body:", req.body);
    console.log(" Query Params:", req.query);

    try {
      const data = typeof body === "string" ? JSON.parse(body) : body;
      console.log("Response:", data);
    } catch (err) {
      console.log("Response (raw):", body);
    }

    console.log("⏱ Duration:", Date.now() - start, "ms");
    console.log("=======================================\n");

    // Call original res.send
    return originalSend.call(this, body);
  };

  next();
};

module.exports = logger;
