"use strict";

/**
 * Index file
 */

const rootPrefix = '.'
  , version = require(rootPrefix + '/package.json').version
  , dynamicGasPrice = require(rootPrefix + '/services/dynamic_gas_price')
;

const OSTDynamicGas = function () {
  const oThis = this;

  oThis.version = version;

  oThis.dynamicGasPrice = dynamicGasPrice;
};

module.exports = new OSTDynamicGas();