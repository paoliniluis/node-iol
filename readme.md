# Node.Js ultra-light wrapper for InvertirOnLine REST API

IMPORTANT UPDATE: there's a new repo & npm package with async/await support and the latest IOL v2 API, check it out @ https://github.com/paoliniluis/node-iol-v2

Disclaimer: I'm not responsible for any damage, of any way, when using this module, if you find any kind of problems, create an issue! Also: I'm not giving any investing advise here, all you see here is personal work and does not have any relationship with the company I work for or any company I worked or I will work in the future!.

[Link to Github repo](https://github.com/paoliniluis/node-iol)

## How to start using this package

1) Ask the guys of InvertirOnline to enable you the API (at the time this was published it was still free and we want them to keep it this way to foster the argentinian capital markets!)
2) Install Node.Js
3) Clone/Download this repo OR create a new folder with any name and do `npm install node-iol`
4) Complete the `auth.json` file with your username and password (if you did the npm install, the file will be inside your node-modules folder)
5) Enjoy!

## Usage

First we create a file (can be index.js) where we require this package if we did the `npm install node-iol` thing
`const iol = require('node-iol');`
or, if we downloaded from github, we require the file directly 
`const iol = require('./node-iol');`
Then we write some code like this one:

~~~~javascript
iol.auth()
.then(token => {
    return Promise.all([iol.getTickerValue(token, 'bcba', 'ay24'), iol.getTickerValue(token, 'bcba', 'ay24d')])
    .then(ay24 => {
        console.log('AY24 price:', ay24[0].ultimoPrecio);
        console.log('AY24D price', ay24[1].ultimoPrecio);
        console.log('Purchasing dollars in the stock market costs:', ay24[0].ultimoPrecio/ay24d[1].ultimoPrecio);
    })
})
.catch(console.log);
~~~~

or maybe something more beautiful like an arbitrage finder across all stocks (an oldie for the current times :P):

~~~~javascript
const iol = require('./node-iol');

iol.auth()
.then(token => {
    return Promise.all([
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
            return iol.buy(token, 'bcba', 'TS', 1, tsPriceInArg, 't0', endOfToday)
        }
    })
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
- Polish the username/password authentication (hey! this was done in just one day!)
