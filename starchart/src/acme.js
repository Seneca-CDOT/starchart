/**
 * Example of acme.Client.auto()
 * https://github.com/publishlab/node-acme-client/blob/master/examples/auto.js
 */

// const fs = require('fs').promises;
const acme = require('acme-client');

const dns = require('./dns');

function log(m) {
    process.stdout.write(`${m}\n`);
}


/**
 * Function used to satisfy an ACME challenge
 *
 * @param {object} authz Authorization object
 * @param {object} challenge Selected challenge
 * @param {string} keyAuthorization Authorization key
 * @returns {Promise}
 */

function challengeCreateFn(authz, challenge, keyAuthorization) {
    log('Triggered challengeCreateFn()');

    const dnsRecord = `_acme-challenge.${authz.identifier.value}`;
    const recordValue = keyAuthorization;

    log(`Creating TXT record for ${authz.identifier.value}: ${dnsRecord}`);
    return dns.createRecord(dnsRecord, 'TXT', recordValue);
}


/**
 * Function used to remove an ACME challenge response
 *
 * @param {object} authz Authorization object
 * @param {object} challenge Selected challenge
 * @param {string} keyAuthorization Authorization key
 * @returns {Promise}
 */

function challengeRemoveFn(authz, challenge, keyAuthorization) {
    log('Triggered challengeRemoveFn()');

    const dnsRecord = `_acme-challenge.${authz.identifier.value}`;
    const recordValue = keyAuthorization;

    log(`Removing TXT record for ${authz.identifier.value}: ${dnsRecord}`);
    return dns.deleteRecord(dnsRecord, 'TXT', recordValue);
}


/**
 * Main
 */

module.exports = async () => {
    // Domain
    const domain = '*.starchart.com';

    // Assumes pebble is running in docker already
    const pebbleDirUrl = 'https://127.0.0.1:14000/dir';

    let directoryUrl = process.env.ACME_DIRECTORY_URL;
    if(!directoryUrl) {
        console.warn(`Missing ACME_DIRECTORY_URL, using ${pebbleDirUrl}`);
        directoryUrl = pebbleDirUrl;
    }

    /* Init client */
    const client = new acme.Client({
        directoryUrl,
        accountKey: await acme.crypto.createPrivateKey()
    });

    /* Create Certificate Signing Request */
    const [key, csr] = await acme.crypto.createCsr({
        commonName: domain,
    });

    /* Certificate */
    const cert = await client.auto({
        csr,
        email: 'mail@starchart.com',
        termsOfServiceAgreed: true,
        challengePriority: ['dns-01'],
        // Just for testing locally...
        skipChallengeVerification: true,
        challengeCreateFn,
        challengeRemoveFn
    });

    /* Done */
    log(`CSR:\n${csr.toString()}\n`);
    log(`Private key:\n${key.toString()}\n`);
    log(`Certificate:\n${cert.toString()}\n`);

    return {
        domain,
        csr: csr.toString(),
        privateKey: key.toString(),
        cert: cert.toString(),
    };
};
