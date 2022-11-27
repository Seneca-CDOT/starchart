#!/bin/bash
set -e

# This is meant to be run on the primary PowerDNS server.
# For example:
#  $ docker exec -it primary /home/pdns/setup.sh
pdnsutil create-zone starchart.com
pdnsutil set-kind starchart.com primary
pdnsutil add-record starchart.com @ NS ns2.starchart.com
pdnsutil add-record starchart.com @ NS ns1.starchart.com
pdnsutil add-record starchart.com ns1 A 10.5.0.20
pdnsutil add-record starchart.com ns2 A 10.5.0.80
pdnsutil add-record starchart.com www A 10.5.0.100
pdnsutil replace-rrset starchart.com . SOA 'ns1.starchart.com. mail.domain.com. 1 10800 3600 604800 3600'
pdnsutil secure-zone starchart.com
pdnsutil increase-serial starchart.com
pdns_control notify starchart.com
pdnsutil check-all-zones
pdnsutil list-zone starchart.com
