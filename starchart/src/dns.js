/**
 * The DNS code below works against two different DNS servers
 * First, we run our PowerDNS Authoritative server, where we
 * want to create actual TXT records.  Second, we run a
 * mock Let's Encrypt (pebble), which has its own DNS
 * mocking challenge server.  So we maintain the same
 * records in both servers.
 */

// TODO: hard-coding for now, see config/primary/pdns.conf
const POWERDNS_API_KEY = process.env.POWERDNS_API_KEY || 'secret-api-key';
const POWERDNS_API_URL = process.env.POWERDNS_API_URL || 'http://localhost:8081/api/v1';

// The Pebble Challenge Server mocking DNS records for the fake Let's Encrypt
const PEBBLE_MOCK_DNS_URL = process.env.PEBBLE_MOCK_DNS_URL || 'http://localhost:8055';

// Our domain (we don't own this, just for testing) 
const STARCHART_ZONE = 'starchart.invalid';

// Make sure a string ends with a `.`, adding if missing
const endsWithPeriod = s => s.replace(/\.?$/, '.');

// Resource Record Set
// https://doc.powerdns.com/authoritative/http-api/zone.html#rrset
class RRSet {
    constructor({ type = 'TXT', changeType, dnsRecord, recordValue }) {
        // Canonical names must end in `.`
        this.name = endsWithPeriod(dnsRecord);
        this.type = type;
        this.changetype = changeType;
        if(changeType !== 'delete') {
            this.ttl = 3600;
        }
        this.records = [{
            // TXT record values must be wrapped in "..."
            content: `"${recordValue}"`,
            disabled: false,
        }];
    }
}

async function patchRecord(changeType, dnsRecord, recordValue) {
    const rrset = new RRSet({ changeType, dnsRecord, recordValue });

    // https://doc.powerdns.com/authoritative/http-api/zone.html#patch--servers-server_id-zones-zone_id
    const res = await fetch(`${POWERDNS_API_URL}/servers/localhost/zones/${STARCHART_ZONE}.`, {
        method: 'PATCH',
        headers: {
            'X-API-Key': POWERDNS_API_KEY,
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({ rrsets: [ rrset ] }),
    });

    // Success will be a 204. Log an error otherwise
    if(res.status !== 204) {
        try {
            console.warn('Error from PowerDNS API', await res.json());
        } catch(_) {
            // 404s don't seem to come back as JSON :(
            console.warn(await res.text());
        } finally {
            throw new Error('Unable to create DNS record');
        }
    }    
}

// Create a TXT record "_acme-challenge.starchart.invalid" with value "_v3lO9-X8YIz66WVylZaxWYZI8bYetULl0vz8GeTZeY"
module.exports.createRecord = (dnsRecord, type = 'TXT', recordValue) => {
    return Promise.all([
        // Update PowerDNS
        patchRecord('replace', dnsRecord, recordValue),
        // Also add a mock DNS entry to our Pebble Challenge Server
        // https://github.com/letsencrypt/pebble/tree/main/cmd/pebble-challtestsrv#dns-01
        fetch(`${PEBBLE_MOCK_DNS_URL}/set-txt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({ host: endsWithPeriod(dnsRecord), value: recordValue }),
        })
    ]);
};

module.exports.deleteRecord = (dnsRecord, type = 'TXT', recordValue) => {
    return Promise.all([
        // Update PowerDNS
        // NOTE: ignoring this for now so record stays in pdns
        // patchRecord('delete', dnsRecord, recordValue),
  
        // Also add a mock DNS entry to our Pebble Challenge Server
        // https://github.com/letsencrypt/pebble/tree/main/cmd/pebble-challtestsrv#dns-01
        fetch(`${PEBBLE_MOCK_DNS_URL}/clear-txt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({ host: endsWithPeriod(dnsRecord) }),
        })
    ]);
};
