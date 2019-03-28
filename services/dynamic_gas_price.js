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
  /**
   * Send request to Eth Gas Station
   *
   * @return {number}
   */
  sendEthGasStationRequest: function () {
    const oThis = this;

    return requestHandler.get(
      "https://ethgasstation.info",
      "/json/predictTable.json"
    ).then(function(responseData){
      return oThis.parseEthGasStationResponse(responseData);
    }).catch(function(err){
      const errorPrefix = '[OST-Dynamic-Gas-Error @ ' + new Date() + ']: EthGasStation:: ';
      console.error(errorPrefix + err);
      return defaultEthereumGasInGWei;
    });
  }

  /**
   * Parse Eth Gas Station response
   *
   * @param responseData
   *
   * @return {number}
   */
  , parseEthGasStationResponse: function(responseData) {
    let lastNonZeroRemaining5m = 0;

    if (responseData && responseData instanceof Array && responseData.length > 0) {
      for (let i in responseData) {
        if (parseFloat(responseData[i]["pct_remaining5m"]) > 0) {
          lastNonZeroRemaining5m = parseFloat(responseData[i]["gasprice"]);
        }
      }
    }

    return lastNonZeroRemaining5m > 0 ? lastNonZeroRemaining5m : defaultEthereumGasInGWei;
  }

  /**
   * Send request to Ether Chain
   *
   * @return {number}
   */
  , sendEtherChainRequest: function() {
    const oThis = this;

    return requestHandler.get(
      "https://www.etherchain.org",
      "/api/gasPriceOracle"
    ).then(function(responseData){
      return oThis.parseEtherChainResponse(responseData);
    }).catch(function(err){
      const errorPrefix = '[OST-Dynamic-Gas-Error @ ' + new Date() + ']: EtherChain :: ';
      console.error(errorPrefix + err);
      return defaultEthereumGasInGWei;
    });
  }

  /**
   * Parse Ether Chain response
   *
   * @param responseData
   *
   * @return {number}
   */
  , parseEtherChainResponse: function(responseData) {
    let standardGasInWei = 0;

    if (responseData && responseData instanceof Object && parseFloat(responseData["standard"]) > 0) {
      standardGasInWei = parseFloat(responseData["standard"]);
    }

    return standardGasInWei > 0 ? standardGasInWei : defaultEthereumGasInGWei;
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
   * @param {number} verifyGasPriceThreshold (optional) - verify gas price on etherchain if eth gas
   * station's gas is above this threshold. Default is 10 GWei
   *
   * @return {Promise<number>}
   */
  get: async function (chainId, verifyGasPriceThreshold) {
    let gasPriceInGWei = 0,
      gasPriceThreshold = verifyGasPriceThreshold || 10;

    // Get dynamic gas for mainnet and ropsten
    if (chainId == 1 || chainId == 3) {
      // Dynamically fetch gas price in GWei from EthGasStation
      gasPriceInGWei = await _private.sendEthGasStationRequest();
      console.log("EthGasStation Gas Price In GWei", gasPriceInGWei);
    }

    // if Gas Price is zero or above certain threshold check on etherchain as well
    if (gasPriceInGWei == defaultEthereumGasInGWei || gasPriceInGWei > gasPriceThreshold) {
      // Dynamically fetch gas price in GWei from etherchain
      let gasPriceInGWeiFromEtherChain = await _private.sendEtherChainRequest();
      console.log("EtherChain Gas Price In GWei", gasPriceInGWeiFromEtherChain);

      // Override gas price if less then gasPriceInGWei
      if (gasPriceInGWeiFromEtherChain != defaultEthereumGasInGWei) {
        gasPriceInGWei = (gasPriceInGWei == defaultEthereumGasInGWei || gasPriceInGWei > gasPriceInGWeiFromEtherChain) ?
          gasPriceInGWeiFromEtherChain : gasPriceInGWei;
      }
    }

    return gasPriceInGWei;
  }

};

module.exports = new DynamicGasPriceKlass();
