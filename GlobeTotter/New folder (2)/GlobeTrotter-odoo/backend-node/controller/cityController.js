const City = require("../models/City");

exports.getCities = async (req, res) => {
  try {
    const { search, country } = req.query;
    let query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (country) {
      query.country = { $regex: country, $options: 'i' };
    }

    const cities = await City.find(query)
      .sort({ name: 1 })
      .limit(100); // Limit results for performance

    res.json(cities);
  } catch (err) {
    console.error("Error fetching cities:", err);
    res.status(500).json({ message: "Server error fetching cities" });
  }
};

exports.getCityById = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);

    if (!city) return res.status(404).json({ message: "City not found" });

    res.json(city);
  } catch (err) {
    console.error("Error fetching city:", err);
    res.status(500).json({ message: "Server error fetching city" });
  }
};

exports.createCity = async (req, res) => {
  try {
    const { name, country, description } = req.body;

    // Check if city already exists
    const existingCity = await City.findOne({ name, country });
    if (existingCity) {
      return res.status(400).json({ message: "City already exists in this country" });
    }

    const city = await City.create({
      name,
      country,
      description
    });

    res.status(201).json(city);
  } catch (err) {
    console.error("Error creating city:", err);
    res.status(500).json({ message: "Server error creating city" });
  }
};

exports.updateCity = async (req, res) => {
  try {
    const { name, country, description } = req.body;

    const city = await City.findByIdAndUpdate(
      req.params.id,
      { name, country, description },
      { new: true, runValidators: true }
    );

    if (!city) return res.status(404).json({ message: "City not found" });

    res.json(city);
  } catch (err) {
    console.error("Error updating city:", err);
    res.status(500).json({ message: "Server error updating city" });
  }
};

exports.deleteCity = async (req, res) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);

    if (!city) return res.status(404).json({ message: "City not found" });

    res.json({ message: "City deleted successfully" });
  } catch (err) {
    console.error("Error deleting city:", err);
    res.status(500).json({ message: "Server error deleting city" });
  }
};
