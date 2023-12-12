

const mongoose = require('mongoose');
// const { logger } = require('./utility/customlog');

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB_URL_LOCALHOST);


const db = mongoose.connection;
// db.on('error', () => logger.error('Connection error.'));
// db.once('open', () =>
//     logger.debug('Connection is established to AVL Database.')
// );

module.exports = { db };


{/* <a tabindex="0" class=" css-rhdfxc" href="https://fastdl.mongodb.org/tools/db/mongodb-database-tools-windows-x86_64-100.9.3.zip" target="_blank" data-track="true">Download<svg class=" css-khvf0o" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.9903 21.3083L22.666 14.663M15.9903 21.3083L9.32319 14.6837M15.9903 21.3083V2.66675M2.6665 21.3293L2.67682 26.68M2.67682 26.68C2.67682 28.1454 3.86501 29.3334 5.33072 29.3334M2.67682 26.68C2.67682 28.1616 3.8488 29.3334 5.33072 29.3334M5.33072 29.3334H26.6793M26.6793 29.3334C28.145 29.3334 29.3332 28.1454 29.3332 26.68M26.6793 29.3334C28.1612 29.3334 29.3332 28.1616 29.3332 26.68M29.3332 26.68V21.3437" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></a> */}