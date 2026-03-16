const Message = require("../models/Message");

exports.getMessages = async (req, res) => {

  try {

    const messages = await Message.find({
      consultation: req.params.consultationId
    }).sort({ createdAt: 1 });

    res.json(messages);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Failed to fetch messages" });

  }

};
