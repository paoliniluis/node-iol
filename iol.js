const axios = require('axios');
const querystring = require('querystring');
const fsp = require ('./fs-promise');
const credentials = require ('./auth.json');

let apiUrl = 'https://api.invertironline.com/api';

const getAccountStatus = (token) => {
    return axios.get(`${apiUrl}/estadocuenta`, 
    {
        headers: { Authorization: `Bearer ${token.access_token}` }
    })
    .then(res => res.data)
}

const getPortfolio = (token) => {
    return axios.get(`${apiUrl}/portafolio`,
    {
        headers: { Authorization: `Bearer ${token.access_token}` }
    })
    .then(res => res.data)
}

const getOperations = (token) => {
    return axios.get(`${apiUrl}/operaciones`, {
        headers: { Authorization: `Bearer ${token.access_token}` }
    })
    .then(res => res.data)
}

const getOperation = (token, number) => {
    return axios.get(`${apiUrl}/operaciones/${number}`, {
        headers: { Authorization: `Bearer ${token.access_token}` }
    })
    .then(res => res.data)
}

const cancelOperation = (token, number) => {
    return axios.delete(`${apiUrl}/operaciones/${number}`, {
        headers: { Authorization: `Bearer ${token.access_token}` }
    })
    .then(res => res.data)
}

const buy = (token, market, asset, quantity, price, term, validTill) => {
    return axios.post(`${apiUrl}/operaciones/api/operar/Comprar`, 
    {
        mercado: market,
        simbolo: asset,
        cantidad: quantity,
        plazo: term,
        validez: validTill
    }, 
    {
        headers: { Authorization: `Bearer ${token.access_token}` }
    })
    .then(res => res.data)
}

const sell = (token, market, asset, quantity, price, validTill)=> {
    return axios.post(`${apiUrl}/operaciones/api/operar/Vender`, 
    {
        mercado: market,
        simbolo: asset,
        cantidad: quantity,
        precio: price,
        validez: validTill
    }, 
    {
        headers: { Authorization: `Bearer ${token.access_token}` }
    })
    .then(res => res.data)
}

const getTicker = (token, market, asset) => {
    return axios.get(`${apiUrl}/${market}/Titulos/${asset}`, {
        headers: { Authorization: `Bearer ${token.access_token}` }
    })
    .then(res => res.data)
}

const getOptions = (token, market, asset) => {
    return axios.get(`${apiUrl}/${market}/Titulos/${asset}/Opciones`, {
        headers: { Authorization: `Bearer ${token.access_token}` }
    })
    .then(res => res.data)
}

const getTickerValue = (token, market, asset) => {
    return axios.get(`${apiUrl}/${market}/Titulos/${asset}/Cotizacion`, {
        headers: { Authorization: `Bearer ${token.access_token}` }
    })
    .then(res => res.data)
}

const getPanels = (token, asset, panel, country) => {
    return axios.get(`${apiUrl}/Cotizaciones/${asset}/${panel}/${country}`, {
        headers: { Authorization: `Bearer ${token.access_token}` }
    })
    .then(res => res.data)
}

const getTickerValuesBetweenDates = (token, market, asset, dateFrom, dateTill, adjusted) => {
    return axios.get(`${apiUrl}/${market}/Titulos/${asset}/Cotizacion/seriehistorica/${dateFrom}/${dateTill}/${adjusted}`, {
        headers: { Authorization: `Bearer ${token.access_token}` }
    })
    .then(res => res.data)
}

const getInstrumentsByCountry = (token, country) => {
    return axios.get(`${apiUrl}/${country}/Titulos/Cotizacion/Instrumentos`, {
        headers: { Authorization: `Bearer ${token.access_token}` }
    })
    .then(res => res.data)
}

const getPanelsByInstrumentAndCountry = (token, country, asset) => {
    return axios.get(`${apiUrl}/${country}/Titulos/Cotizacion/Paneles/${asset}`, {
        headers: { Authorization: `Bearer ${token.access_token}` }
    })
    .then(res => res.data)
}

const readToken = () => {
    return new Promise ((resolve, reject) => {
        fsp.read('token.json')
        .then(tokenData => resolve(JSON.parse(tokenData)))
        .catch(reject)
    })
}

const auth = () => {
    return new Promise ((resolve, reject) => {
        fsp.exists('token.json')
        .then(exists => {
            if (exists) {
                fsp.read('token.json')
                .then(tokenData => {
                    let token = JSON.parse(tokenData);
                    if (new Date(token['.expires']) < new Date()) {
                        fsp.unlink('token.json')
                        .then(() => getToken(token.refresh_token))
                        .then(() => resolve(readToken()))
                        .catch(reject)
                    } else {
                        resolve(token);
                    }
                })
                .catch(reject)
            } else {
                getToken()
                .then(() => resolve(readToken()))
                .catch(reject);
            }
        })
    })
}

const getToken = (refreshToken) => {
    let creds = '';
    if (refreshToken) {
        creds = querystring.stringify({ refresh_token: refreshToken, grant_type: 'refresh_token' });
    } else {
        creds = querystring.stringify(credentials);
    }
    return axios.post('https://api.invertironline.com/token', creds)
    .then(res => fsp.append('token.json', JSON.stringify(res.data)))
}

module.exports = {
    getAccountStatus,
    getPortfolio,
    getOperation,
    getOperations,
    cancelOperation,
    buy,
    sell,
    getTicker,
    getOptions,
    getTickerValue,
    getPanels,
    getTickerValuesBetweenDates,
    getInstrumentsByCountry,
    getPanelsByInstrumentAndCountry,
    auth
}