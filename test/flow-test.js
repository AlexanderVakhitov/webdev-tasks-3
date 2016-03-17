'use strict';

var flow = require('../lib/flow.js');
var should = require('chai').should();
var sinon = require('sinon');

describe('Test module: flow.js', function () {
    describe('Test: flow.serial()', function () {
        it('should call all functions and main callback', function () {
            var firstFunc = sinon.spy(function (callback) {
                callback(null, 'data');
            });
            var secondFunc = sinon.spy(function (data, callback) {
                callback(null, 'data');
            });
            var mainCb = sinon.spy();
            flow.serial([
                firstFunc,
                secondFunc
            ], mainCb);
            firstFunc.calledOnce.should.be.true;
            secondFunc.calledOnce.should.be.true;
            mainCb.calledOnce.should.be.true;
        });
        it('should call all async functions and main callback', function (done) {
            var firstFunc = sinon.spy(function (callback) {
                setTimeout(callback, 0, null);
            });
            var secondFunc = sinon.spy(function (data, callback) {
                setTimeout(callback, 0, null);
            });
            var mainCb = sinon.spy(function(error, data) {
                firstFunc.calledOnce.should.be.true;
                secondFunc.calledOnce.should.be.true;
                mainCb.calledOnce.should.be.true;
                done();
            });
            flow.serial([
                firstFunc,
                secondFunc
            ], mainCb);
        });
        it('should call second function after first function', function () {
            var firstFunc = sinon.spy(function (callback) {
                callback(null, 'result');
            });
            var secondFunc = sinon.spy();
            flow.serial([
                firstFunc,
                secondFunc
            ], function () {});
            secondFunc.calledOnce.should.be.true;
            secondFunc.calledAfter(firstFunc).should.be.true;
        });
        it('should call second function with results of first function', function () {
            var firstFunc = function (callback) {
                callback(null, 'result');
            };
            var secondFunc = sinon.spy();
            flow.serial([
                firstFunc,
                secondFunc
            ], function () {});
            secondFunc.calledWith('result').should.be.true;
        });
        it('should call all async functions in right order', function (done) {
            var firstFunc = sinon.spy(function (callback) {
                setTimeout(callback, 0, null, 'data1');
            });
            var secondFunc = sinon.spy(function (data, callback) {
                setTimeout(callback, 0, null, data + 'data2');
            });
            var mainCb = sinon.spy(function(error, data) {
                data.should.be.equal('data1data2');
                secondFunc.calledAfter(firstFunc).should.be.true;
                done();
            });
            flow.serial([
                firstFunc,
                secondFunc
            ], mainCb);
        });
        it('should not call second function after error in first function', function () {
            var firstFunc = sinon.spy(function (callback) {
                callback('error', 'data');
            });
            var secondFunc = sinon.spy();
            flow.serial([
                firstFunc,
                secondFunc
            ], function () {});
            secondFunc.notCalled.should.be.true;
        });
        it('should call main callback with results of last function', function () {
            var lastFunc = function (callback) {
                callback(null, 'result');
            };
            var mainCb = sinon.spy();
            flow.serial([
                lastFunc
            ], mainCb);
            mainCb.calledWith(null, 'result').should.be.true;
        });
        it('should call main callback if first argument is [] (empty array)', function () {
            var mainCb = sinon.spy();
            flow.serial([], mainCb);
            mainCb.calledOnce.should.be.true;
            mainCb.calledWith(null).should.be.true;
        });
    });

    describe('Test: flow.parallel()', function () {
        it('should call all functions and main callback', function () {
            var firstFunc = sinon.spy(function (callback) {
                callback(null, 'data');
            });
            var secondFunc = sinon.spy(function (callback) {
                callback(null, 'data');
            });
            var mainCb = sinon.spy();
            flow.parallel([
                firstFunc,
                secondFunc
            ], mainCb);
            firstFunc.calledOnce.should.be.true;
            secondFunc.calledOnce.should.be.true;
            mainCb.calledOnce.should.be.true;
        });
        it('should call all async functions and main callback', function (done) {
            var firstFunc = sinon.spy(function (callback) {
                setTimeout(callback, 0, null);
            });
            var secondFunc = sinon.spy(function (callback) {
                setTimeout(callback, 0, null);
            });
            var mainCb = sinon.spy(function(error, data) {
                firstFunc.calledOnce.should.be.true;
                secondFunc.calledOnce.should.be.true;
                mainCb.calledOnce.should.be.true;
                done();
            });
            flow.parallel([
                firstFunc,
                secondFunc
            ], mainCb);
        });
        it('should call callback with expected array of results', function () {
            var firstFunc = function (callback) {
                callback(null, 'data1');
            };
            var secondFunc = function (callback) {
                callback(null, 'data2');
            };
            var mainCb = sinon.spy();
            flow.parallel([
                firstFunc,
                secondFunc
            ], mainCb);
            mainCb.calledWith(null, ['data1', 'data2']).should.be.true;
        });
        it('should call callback with expected array of results (async functions, different time)', function (done) {
            var firstFunc = sinon.spy(function (callback) {
                setTimeout(callback, 0, null, 'data1');
            });
            var secondFunc = sinon.spy(function (callback) {
                setTimeout(callback, 1000, null, 'data2');
            });
            var mainCb = sinon.spy(function(error, data) {
                mainCb.calledWith(null, ['data1', 'data2']).should.be.true;
                done();
            });
            flow.parallel([
                firstFunc,
                secondFunc
            ], mainCb);
        });
        it('should call all functions if one of functions gets error', function () {
            var firstFunc = sinon.spy(function (callback) {
                callback(null, 'data');
            });
            var secondFunc = sinon.spy(function (callback) {
                callback('error', 'data');
            });
            flow.parallel([
                firstFunc,
                secondFunc
            ], function () {});
            firstFunc.calledOnce.should.be.true;
            secondFunc.calledOnce.should.be.true;
        });
        it('should call all functions if one of functions gets error (async functions, different time)', function (done) {
            var firstFunc = sinon.spy(function (callback) {
                setTimeout(callback, 0, 'error');
            });
            var secondFunc = sinon.spy(function (callback) {
                setTimeout(callback, 500, null);
            });
            var mainCb = sinon.spy(function(error, data) {
                firstFunc.calledOnce.should.be.true;
                secondFunc.calledOnce.should.be.true;
                mainCb.calledWith('error').should.be.true;
                done();
            });
            flow.parallel([
                firstFunc,
                secondFunc
            ], mainCb);
        });
        it('should call main callback with error if one of functions gets error', function () {
            var firstFunc = function (callback) {
                callback(null, 'data');
            };
            var secondFunc = function (callback) {
                callback('error', 'data');
            };
            var mainCb = sinon.spy();
            flow.parallel([
                firstFunc,
                secondFunc
            ], mainCb);
            mainCb.calledWith('error').should.be.true;
        });
        it('should call main callback if first argument is [] (empty array)', function () {
            var mainCb = sinon.spy();
            flow.parallel([], mainCb);
            mainCb.calledOnce.should.be.true;
            mainCb.calledWith(null, []).should.be.true;
        });
    });

    describe('Test: flow.map()', function () {
        it('should call all functions and main callback', function () {
            var func = sinon.spy(function (data, callback) {
                callback(null, data);
            });
            var mainCb = sinon.spy();
            flow.map([1, 2, 3], func, mainCb);
            func.calledThrice.should.be.true;
            mainCb.calledOnce.should.be.true;
        });
        it('should call main callback with expected data', function () {
            var func = function (data, callback) {
                callback(null, data);
            };
            var mainCb = sinon.spy();
            flow.map([1, 2, 3], func, mainCb);
            mainCb.calledWith(null, [1, 2, 3]).should.be.true;
        });
        it('should call main callback with expected data (async function)', function (done) {
            var func = function (data, callback) {
                setTimeout(callback, 0, null, data);
            };
            var mainCb = sinon.spy(function(error, data) {
                mainCb.calledWith(null, [1, 2, 3]).should.be.true;
                done();
            });
            flow.map([1, 2, 3], func, mainCb);
        });
        it('should call all functions if one of functions gets error', function () {
            var func = sinon.spy(function (data, callback) {
                callback(data === 3 ? 'error' : null, data)
            });
            flow.map([1, 2, 3], func, function () {});
            func.calledThrice.should.be.true;
        });
        it('should call main callback with error if one of functions gets error', function () {
            var func = function (data, callback) {
                callback(data === 3 ? 'error' : null, data)
            };
            var mainCb = sinon.spy();
            flow.map([1, 2, 3], func, mainCb);
            mainCb.calledWith('error').should.be.true;
        });
        it('should call main callback if first argument is [] (empty array)', function () {
            var mainCb = sinon.spy();
            flow.map([], function () {}, mainCb);
            mainCb.calledOnce.should.be.true;
            mainCb.calledWith(null, []).should.be.true;
        });
    });
});
