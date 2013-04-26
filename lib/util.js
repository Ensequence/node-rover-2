module.exports = {

    stringToHex: function (str) {
        var hex = new Buffer(str.length);
        for (var i = 0; i < str.length; i++) {
            (function(index) {
                var charHex = str.charCodeAt(index);
                hex[index] = charHex;
            })(i);
        }
        return hex;
    }
};