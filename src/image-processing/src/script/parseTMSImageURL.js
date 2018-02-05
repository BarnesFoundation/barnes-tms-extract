const cheerio = require('cheerio');
const fs = require('fs');
const https = require('https');
const path = require('path');
const url = require('url');

const logger = require('../script/imageLogger.js');

function parsePageData(data) {
	const $ = cheerio.load(data);
	logger.info("Parsing tms image page");
	const retVal = [];
	$('tr').each(function (idx) {
		if (idx > 0) {
			try {
				const tds = $(this).children('td');
				if (tds.length === 3) {
					const data = {
						name: $($(tds[0]).children('a')).children('tt').text().trim(),
						size: $(tds[1]).children('tt').text().trim(),
						modified: $(tds[2]).children('tt').text().trim(),
					};
					retVal.push(data);
				}
			} catch (e) {
				console.log(e);
			}
		}
	});

	if (retVal.length == 0) {
	  logger.error('Empty images list from tms')
	  logger.error(data)
	  process.exit(-1)
	}

	const o = {
		images: retVal,
	};
	
	logger.info("Got the data");
	return o;
}

function parseTMSImageURL(tmsurl) {
	return new Promise((resolve, reject) => {
		const req = https.request(tmsurl, (res) => {
			let data = '';

			res.on('data', (d) => {
				data += d;
			});

			res.on('end', () => {
				try {
					resolve(parsePageData(data));
				} catch (e) {
					logger.warn("Page parse error " + e);
					reject(e);
				}
			});
		});

		req.on('error', (e) => {
			reject(e);
		});

		req.end();
	})
}

module.exports = parseTMSImageURL;
