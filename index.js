'use strict';

let FraudFinderError = require('../util/ff-error');

module.exports = class FraudFinder {
    construct(token) {
        this._token = token || process.env.FRAUDFINDER_TOKEN;

        if (!this._token) {
            throw FraudFinderError('FF-001');
        }
    }
}