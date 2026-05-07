const {
  registerUser,
  loginUser,
  refreshAccessToken
} = require("../services/auth.service");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const result = await registerUser(name, email, password);

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// REFRESH
exports.refresh = async (req, res) => {
  try {
    const { token } = req.body;

    const newAccessToken = await refreshAccessToken(token);

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};