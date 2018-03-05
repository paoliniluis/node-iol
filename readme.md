Disclaimer: I'm not responsible for any damage, of any way, when using this module, if you find any kind of problems, create an issue!

# Node.Js ultra-light wrapper for InvertirOnLine REST API

## How to start using this package
1) Ask the guys of InvertirOnline to enable you the API (at the time this was published it was still free and we want them to keep it this way to foster the argentinian capital markets!)
2) Install Node.Js
3) Clone or Download this repo
4) Complete the `auth.json` file with your username and password
5) Enjoy!

## Usage
First we create a file where we require this package
`const iol = require('node-iol');`
Then we write some code like this one:

~~~~
iol.getTickerValue('bcba', 'ay24')
.then(ay24 => {
    console.log('AY24 price:', ay24.ultimoPrecio);
    return iol.getTickerValue('bcba', 'ay24d')
    .then(ay24d => {
        console.log('AY24D price', ay24d.ultimoPrecio);
        console.log('Purchasing dollars in the stock market costs:', ay24.ultimoPrecio/ay24d.ultimoPrecio);
    })
})
.catch(console.log);
~~~~

or maybe something more beautiful like an arbitrage finder across all stocks:
~~~~
const iol = require('./iol');

iol.auth()
.then(token => {
    Promise.all([
        iol.getTickerValue(token, 'bcba', 'ay24'), 
        iol.getTickerValue(token, 'bcba', 'ay24d'),
        iol.getTickerValue(token, 'bcba', 'TS'),
        iol.getTickerValue(token, 'nyse', 'TS')])
    .then(values => {
        let ccl = values[0].ultimoPrecio/values[1].ultimoPrecio;
        let tsPriceInArg = values[2].ultimoPrecio;
        let tsPriceInUsa = values[3].ultimoPrecio;
        console.log('AY24 price:', values[0].ultimoPrecio);
        console.log('AY24D price', values[1].ultimoPrecio);
        console.log('TS price in ARG', tsPriceInArg);
        console.log('TS price in USA', tsPriceInUsa);
        console.log('Purchasing dollars in the stock market costs:', ccl);
        if (((((tsPriceInUsa * ccl) / tsPriceInArg) / 2) - 1) > 0.01) { //ARBITRAGE!!!
            let endOfToday = new Date();
            endOfToday.setHours(23,59,59,999);
            return iol.buy(token, 'bcba', 'TS', 100, tsPriceInArg, 't0', endOfToday)
        }
    })
    .catch(console.log)
})
.catch(console.log)
~~~~

### Notes
 - Asking the API for prices of USA is still not supported, I made the above example just for showing the use case
 - Also, the arbitraging concept depends on how much you pay for each trade
 - Last but not least, the price difference between both markets has a conversion factor that needs to be applied (this case is 2)

## To Do
- Tests Tests Tests (Mocha)
- Review The getTickerValuesBetweenDates function, haven't tried it, specially dates formats
- Check the refresh token function, it's not behaving as it should