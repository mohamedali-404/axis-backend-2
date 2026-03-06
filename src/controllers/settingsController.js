const Settings = require('../models/Settings');

exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (settings) {
            const { _id, createdAt, updatedAt, __v, ...updateData } = req.body;
            settings = await Settings.findByIdAndUpdate(settings._id, { $set: updateData }, { new: true, runValidators: true });

            // Emit real-time settings update to all clients
            const io = req.app.get('io');
            if (io) {
                io.emit('settings_updated', settings);
            }

            res.json(settings);
        } else {
            const { _id, createdAt, updatedAt, __v, ...updateData } = req.body;
            settings = await Settings.create(updateData);

            const io = req.app.get('io');
            if (io) {
                io.emit('settings_updated', settings);
            }

            res.status(201).json(settings);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
