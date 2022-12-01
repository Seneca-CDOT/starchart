#!/bin/bash
set -e

# This is meant to be run on the primary PowerDNS server.
# For example:
#  $ docker exec -it primary /home/pdns/setup.sh
pdnsutil create-zone starchart.invalid
pdnsutil set-kind starchart.invalid primary
pdnsutil add-record starchart.invalid @ NS ns1.starchart.invalid
pdnsutil add-record starchart.invalid @ NS ns2.starchart.invalid
pdnsutil add-record starchart.invalid ns1 A 10.5.0.20
pdnsutil add-record starchart.invalid ns2 A 10.5.0.80
pdnsutil add-record starchart.invalid www A 10.5.0.100
pdnsutil replace-rrset starchart.invalid . SOA 'ns1.starchart.invalid. mail@starchart.invalid. 1 10800 3600 604800 3600'
pdnsutil secure-zone starchart.invalid
pdnsutil increase-serial starchart.invalid
pdns_control notify starchart.invalid
pdnsutil check-all-zones
pdnsutil list-zone starchart.invalid
