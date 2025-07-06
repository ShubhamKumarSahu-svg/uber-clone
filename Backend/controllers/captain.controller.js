const captainModel = require('../models/captain.model');
const captainService = require('../services/captain.service');
const blacklistTokenModel = require('../models/blacklistToken.model');
module.exports.registerCaptain = async (req, res, next) => {
  const {
    fullname: { firstname, lastname },
    email,
    password,
  } = req.body;

  const isAlreadyCaptain = await captainModel.findOne({ email });
  if (isAlreadyCaptain) {
    return res.status(400).json({ message: 'Captain already exists' });
  }

  const hashedPassword = await captainModel.hashPassword(password);

  const captainData = {
    fullname: { firstname, lastname },
    email,
    password: hashedPassword,
    vehicle: {
      color: req.body.vehicle.color,
      plate: req.body.vehicle.plate,
      capacity: req.body.vehicle.capacity,
      type: req.body.vehicle.type,
    },
  };

  const captain = await captainService.createCaptain(captainData);

  if (!captain) {
    return res.status(500).json({ message: 'Failed to create captain' });
  }

  const token = captain.generateAuthToken();

  res.status(201).json({ token, captain });
};

module.exports.loginCaptain = async (req, res, next) => {
  const { email, password } = req.body;

  const captain = await captainModel.findOne({ email }).select('+password');
  if (!captain) {
    return res.status(401).json({ message: 'Captain not found' });
  }

  const isMatch = await captain.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = captain.generateAuthToken();

  res.cookie('token', token, {
    httpOnly: true, // Secure this in production
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.status(200).json({ token, captain });
};

module.exports.getCaptainProfile = async (req, res, next) => {
  const captainId = req.captain._id; // Assuming captain ID is set in req.captain by authentication middleware

  const captain = await captainModel.findById(captainId).select('-password');
  if (!captain) {
    return res.status(404).json({ message: 'Captain not found' });
  }

  res.status(200).json({ captain });
};

module.exports.logoutCaptain = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Add token to blacklist (assuming you have a blacklistToken model)
  await blacklistTokenModel.create({ token });

  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};
