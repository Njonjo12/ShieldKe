const Message = require("../models/Message");

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      consultation: req.params.consultationId,
    })
      .populate("sender", "name role")
      .sort({ createdAt: 1 });

    res.json(messages || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { consultation, text } = req.body;

    const message = await Message.create({
      consultation,
      sender: req.user.id,
      text,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
