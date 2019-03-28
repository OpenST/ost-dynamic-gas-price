# OST Dynamic Gas Price

This service fetches an estimated gas price for which transaction could get mined in less than 5 minutes.

Two services are used for this purpose. 
1. [Eth Gas Station](https://ethgasstation.info/)  
    This service is used primarily. An API call is made to the below URL and gasPrices are parsed for usage.  
    (Source: 'https://ethgasstation.info/json/predictTable.json').
2. [Ether Chain](https://www.etherchain.org/)  
    In case EthGasStation returns gasPrice as 0 or a price greater than the threshold, price is fetched from EtherChain.  
    (Source: 'https://www.etherchain.org/tools/gasPriceOracle').

Usage:

````
dynamicGasPriceProvider = require('@ostdotcom/ost-dynamic-gas-price');
chainId = 1; //main Ethereum Network
dynamicGasPriceProvider.dynamicGasPrice.get(chainId).then(function(val){
console.log("Gas Price In GWei", val);
});
````
