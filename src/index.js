"use strict";
exports.__esModule = true;
var crypto_ts_1 = require("crypto-ts");
var Providers = {
    // Orange
    1: [0.65, 0.65, 0.65],
    // Play
    2: [0.55, 0.65, 0.70],
    // T-Mobile
    3: [0.60, 0.60, 0.60],
    // Plus
    4: [0.50, 0.50, 0.50]
};
var RequiredFieldsParse = [
    'id', 'status', 'valuenet', 'sign'
];
var SimPay = /** @class */ (function () {
    function SimPay() {
        this.errorCode = 0;
        this.apiKey = '';
        this.status = '';
        this.value = 0;
        this.valueGross = 0;
        this.control = '';
        this.transId = '';
        this.valuePartner = 0;
        this.userNumber = '';
    }
    SimPay.prototype.Parse = function (data) {
        for (var _i = 0, RequiredFieldsParse_1 = RequiredFieldsParse; _i < RequiredFieldsParse_1.length; _i++) {
            var field = RequiredFieldsParse_1[_i];
            if (data[field] === undefined) {
                return this.SetError(1);
            }
        }
        this.transId = data.id;
        this.status = data.status;
        this.value = Number(data.valuenet);
        this.valueGross = data.valuenet_gross;
        this.valuePartner = Number(data.valuepartner);
        if (data.control) {
            this.control = data.control;
        }
        if (data.number_from) {
            this.userNumber = data.number_from;
        }
        if (data.value <= 0 || this.valuePartner) {
            return this.SetError(4);
        }
        var hash = this.transId + this.status + data.valuenet + data.valuepartner + this.control + this.apiKey;
        if (crypto_ts_1.SHA256(hash).toString() !== data.sign) {
            return this.SetError(3);
        }
        return true;
    };
    SimPay.prototype.IsError = function () {
        return this.errorCode !== 0;
    };
    SimPay.prototype.GetErrorText = function () {
        switch (this.errorCode) {
            case 0:
                return 'No error';
            case 1:
                return 'Missing parameters';
            case 2:
                return 'No sign param';
            case 3:
                return 'Wrong sign';
            case 4:
                return 'Wrong amount value';
        }
        return 'Unknown error';
    };
    SimPay.prototype.SetError = function (errorCode) {
        this.errorCode = errorCode;
        return false;
    };
    SimPay.prototype.SetAPIKey = function (apiKey) {
        this.apiKey = apiKey;
    };
    SimPay.prototype.GetStatus = function () {
        return this.status;
    };
    SimPay.prototype.GetValue = function () {
        return this.value;
    };
    SimPay.prototype.GetValueGross = function () {
        return this.valueGross;
    };
    SimPay.prototype.GetControl = function () {
        return this.control;
    };
    SimPay.prototype.IsTransactionPaid = function () {
        return this.status === 'ORDER_PAYED';
    };
    SimPay.prototype.GetTransactionID = function () {
        return this.transId;
    };
    SimPay.prototype.TransactionOK = function () {
        return 'OK';
    };
    SimPay.prototype.GetValuePartner = function () {
        return this.valuePartner;
    };
    SimPay.prototype.GetUserNumber = function () {
        return this.userNumber;
    };
    SimPay.prototype.GetRewardPartner = function (amount, provider) {
        if (amount <= 0) {
            return 0;
        }
        if (!Providers[provider]) {
            return 0;
        }
        if (amount < 9) {
            return Providers[provider][0];
        }
        else if (amount < 25) {
            return Providers[provider][1];
        }
        else {
            return Providers[provider][2];
        }
    };
    return SimPay;
}());
exports.SimPay = SimPay;
