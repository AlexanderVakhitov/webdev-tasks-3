'use strict';

module.exports.serial = function (functions, callback) {
    if (functions.length === 0) {
        callback(null);
        return;
    }
    var index = 0;
    var serialCallback = function (error, data) {
        ++index;
        if (error || index >= functions.length) {
            callback(error, data);
            return;
        }
        functions[index](data, serialCallback);
    };
    functions[0](serialCallback);
};

module.exports.parallel = function (functions, callback) {
    if (functions.length === 0) {
        callback(null, []);
        return;
    }
    var counter = 0;
    var result = [];
    var indexes = functions.map(function (item, index) {
        return index;
    });
    indexes.forEach(function (index) {
        var parallelCallback = function (error, data) {
            ++counter;
            result[index] = data;
            if (error || counter === functions.length) {
                callback(error, result);
            }
        };
        functions[index](parallelCallback);
    });
};

module.exports.map = function (values, func, callback) {
    var adaptFunctions = [];
    values.forEach(function (value) {
        adaptFunctions.push(
            function (callback) {
                func(value, callback);
            });
    });
    module.exports.parallel(adaptFunctions, callback);
};
