import User from "../models/User.js";

export const getLawyers = async (req, res) => {

  try {

    const { practiceArea, location } = req.query;

    const filter = { role: "lawyer" };

    if (practiceArea) filter.practiceArea = practiceArea;
    if (location) filter.location = location;

    const lawyers = await User.find(filter).select(
      "name email practiceArea location experience consultationFee bio"
    );

    res.json(lawyers);

  } catch (error) {

    res.status(500).json({ message: "Failed to fetch lawyers" });

  }

};
