const { merge } = require("webpack-merge");
const common = require("./webpack.worklet.common.js");

const worklet = merge(common, {
    mode: "production",
    optimization: {
        minimize: false,
    },
});
module.exports = [worklet];
