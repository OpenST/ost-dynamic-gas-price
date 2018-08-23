"use strict";

/**
 * Suggest gas price dynamically for ethereum mainchain
 *
 * @module services/dynamic_gas
 *
 */

const rootPrefix = '..'
  , requestHandler = require(rootPrefix + '/lib/request')
;

const defaultEthereumGasInGWei = 0;

const _private = {

  // Send request to eth gas station
  sendRequest: function (onResolve) {
    const oThis = this;

    requestHandler.get(
      "https://ethgasstation.info/",
      "/json/predictTable.json"
    ).then(function(responseData){
      const gasPrice = oThis.parseResponse(responseData, onResolve);
      oThis.renderResponse(gasPrice, onResolve);
    }).catch(function(err){
      const errorPrefix = '[OST-Dynamic-Gas-Error @ ' + new Date() + ']: ';
      console.error(errorPrefix + err);
      oThis.renderResponse(defaultEthereumGasInGWei, onResolve);
    });
  }

  // parse eth gas station response
  , parseResponse: function(responseData) {
    var lastNonZeroRemaining5m = 0;

    if (responseData && responseData.constructor === Array && responseData.length > 0) {
      for (var i in responseData) {
        if (parseFloat(responseData[i]["pct_remaining5m"]) > 0) {
          lastNonZeroRemaining5m = parseFloat(responseData[i]["gasprice"]);
        }
      }
    }

    return lastNonZeroRemaining5m > 0 ? lastNonZeroRemaining5m : defaultEthereumGasInGWei;
  }

  // render the final response
  , renderResponse: function(gasInGWei, onResolve) {
    onResolve(gasInGWei);
  }
};

/**
 * Constructor to suggest dynamic gas price for ethereum mainchain
 *
 * @constructor
 */
const DynamicGasPriceKlass = function () {
};

DynamicGasPriceKlass.prototype = {

  /**
   * Suggest gas price based on chain Id
   *
   * @param {string} chainId - Chain Id
   *
   */
  get: function (chainId) {
    return new Promise(function (onResolve, onReject) {
      if (chainId == 1 || chainId == 3) {
        // Dynamically fetch ethereum gas in GWei
        _private.sendRequest(onResolve);
      } else {
        // For unknown chain return 0 GWei
        _private.renderResponse(0, onResolve);
      }
    });
  }

};

module.exports = new DynamicGasPriceKlass();
