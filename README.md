# OST Dynamic Gas Price

This fetches an estimated gas price for which Transaction could get mined in less than 5 minutes (source: 'https://ethgasstation.info/txPoolReport.php').

Usage:

````
dynamicGasPriceProvider = require('@ostdotcom/ost-dynamic-gas-price');
chainId = 1; //main Ethereum Network
dynamicGasPriceProvider.dynamicGasPrice.get(chainId)
.then(function(val){
    estimatedCurrentGasPrice =  val;
});
````
