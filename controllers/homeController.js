exports.home = (req, res) => {
    res.status(200).json({
        success: true,
        greeting: "Hello"
    });
};

exports.homeDummy = (req, res) => {
    res.status(200).json({
        success: true,
        greeting: "Dummy route"
    });
};