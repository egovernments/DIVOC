#!/bin/sh
#
# Configure cert.conf file before executing this command
#
# Supports 2 Cryptographic algorithm RSA & ECDSA required for EU Adaptor configuration
# Allows users to generate either CSR (with CSR argument) or Self-signer Certificates (with CERTIFICATE argument)
# private key filename - DSC01privkey.key
# CSR filename - DSC01csr.pem
# CERTIFICATE key filename - DSC01cert.pem
#
set -e

OPENSSL=${OPENSSL:=openssl}

if [[ "$1" == "RSA" && "$2" == "CSR" ]]; then
  ${OPENSSL} req -new -newkey rsa:4096 -nodes -keyout DSC01privkey.key -out DSC01csr.pem -config cert.conf
elif [[ "$1" == "RSA" && "$2" == "CERTIFICATE" ]]; then
  ${OPENSSL} req -x509 -newkey rsa:4096 -nodes -keyout DSC01privkey.key -out DSC01cert.pem -config cert.conf -days 365
elif [[ "$1" == "ECDSA" && "$2" == "CSR" ]]; then
  ${OPENSSL} ecparam -name prime256v1 -out privkey.key -genkey
  ${OPENSSL} req -new -key privkey.key -out DSC01csr.pem -config cert.conf
  ${OPENSSL} pkcs8 -in privkey.key -nocrypt -topk8 -out DSC01privkey.key
  # Remove unneeded keys
  rm -f privkey.key
elif [[ "$1" == "ECDSA" && "$2" == "CERTIFICATE" ]]; then
  ${OPENSSL} ecparam -name prime256v1 -out privkey.key -genkey
  ${OPENSSL} req -x509 -new -key privkey.key -out DSC01cert.pem -config cert.conf -days 365
  ${OPENSSL} pkcs8 -in privkey.key -nocrypt -topk8 -out DSC01privkey.key
  # Remove unneeded keys
  rm -f privkey.key
else
  echo "Usage: $0 algorithm request \n"
  echo "algorithm - can be RSA or ECDSA \n"
  echo "request - can be CSR or CERTIFICATE \n"
fi