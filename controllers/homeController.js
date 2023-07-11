const BigPromise = require('../middlewares/bigPromise');

exports.home = BigPromise(async (req, res) => {
    // const db = await something()
    res.status(200).json({
        success: true,
        greeting: "Hello"
    });
});

exports.homeDummy = async (req, res) => {
    try {
        // const db = await something()
        res.status(200).json({
            success: true,
            greeting: "Dummy route"
        });
    } catch (error) {
        console.log(error);
    };
};