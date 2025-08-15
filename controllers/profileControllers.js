const CustomError = require("../utils/customError");
const profileService = require("../services/profileServices");

const getProfileController = async (req, res, next) => {
  try {
    const result = await profileService.getProfileService(req);
    res.status(200).json(result);
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

const getAvailableFeaturesController = async (req, res, next) => {
  try {
    const result = await profileService.getAvailableFeatureService(req);
    res.status(200).json(result);
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

const getAllTierWiseFeaturesController = async (req, res, next) => {
  try {
    const result = await profileService.getAllTierWiseFeaturesService(req);
    res.status(200).json(result);
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

const listAllFeaturesController = async (req, res, next) => {
  try {
    const result = await profileService.listAllFeaturesService(req);
    res.status(200).json(result);
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

const getFeatureDetailsController = async (req, res, next) => {
  try {
    const result = await profileService.getFeatureDetailsService(req);
    res.status(200).json(result);
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

module.exports = {
    getProfileController,
    getFeatureDetailsController,
    getAvailableFeaturesController,
    getAllTierWiseFeaturesController,
    listAllFeaturesController
}