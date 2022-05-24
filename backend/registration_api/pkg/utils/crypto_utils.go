package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"github.com/gospotcheck/jwt-go"
	log "github.com/sirupsen/logrus"
	"io"
	"strings"
)

func GenSecKey() []byte {
	bytes := make([]byte, 32) //generate a random 32 byte key for AES-256
	if _, err := rand.Read(bytes); err != nil {
		panic(err.Error())
	}

	return bytes
}

func SymmetricEncrypt(plaintext []byte, key []byte) (encryptedString string) {
	//Create a new Cipher Block from the key
	block, err := aes.NewCipher(key)
	if err != nil {
		panic(err.Error())
	}

	//Create a new GCM - https://en.wikipedia.org/wiki/Galois/Counter_Mode
	//https://golang.org/pkg/crypto/cipher/#NewGCM
	aesGCM, err := cipher.NewGCMWithNonceSize(block, 16)
	if err != nil {
		panic(err.Error())
	}

	//Create a nonce. Nonce should be from GCM
	nonce := make([]byte, aesGCM.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		panic(err.Error())
	}

	//Encrypt the data using aesGCM.Seal
	//Since we don't want to save the nonce somewhere else in this case, we add it as a prefix to the encrypted data. The first nonce argument in Seal is the prefix.
	ciphertext := aesGCM.Seal(nil, nonce, plaintext, nil)

	return string(ciphertext)+string(nonce)
}

func SymmetricDecrypt(encryptedString string, key []byte) (decryptedString string) {

	enc := []byte(encryptedString)

	//Create a new Cipher Block from the key
	block, err := aes.NewCipher(key)
	if err != nil {
		panic(err.Error())
	}

	//Create a new GCM
	aesGCM, err := cipher.NewGCMWithNonceSize(block, 16)
	if err != nil {
		panic(err.Error())
	}

	//Get the nonce size
	nonceSize := aesGCM.NonceSize()

	//Extract the nonce from the encrypted data
	ciphertext, nonce := enc[:len(enc)-nonceSize], enc[len(enc)-nonceSize:]

	//Decrypt the data
	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		panic(err.Error())
	}

	return fmt.Sprintf("%s", plaintext)
}

func AsymmetricEncrypt(plaintext []byte, publicKey *rsa.PublicKey) (encryptedString []byte, err error) {

	encryptedData, err := rsa.EncryptOAEP(sha256.New(), rand.Reader,publicKey, plaintext, nil)
	if err != nil {
		log.Errorf("Error during asymmetric encrypt - %v", err)
		return nil, err
	}

	return encryptedData, nil
}

func AsymmetricDecrypt(encryptedString []byte, privateKey string) (decryptedString string, err error) {

	keyFromPem, _ := jwt.ParseRSAPrivateKeyFromPEM([]byte(privateKey))

	decryptedData, decryptErr := rsa.DecryptOAEP(sha256.New(), rand.Reader, keyFromPem, encryptedString, nil)
	if decryptErr != nil {
		log.Errorf(" Error while decrypt - %v ", decryptErr)
		return "", decryptErr
	}

	return string(decryptedData), nil
}

func DigestAsPlainText(bytes []byte) string {
	hasher := sha256.New()
	hasher.Write(bytes)
	return strings.ToUpper(hex.EncodeToString(hasher.Sum(nil)))
}

func Sha256Hash(bytes []byte) []byte {
	hasher := sha256.New()
	hasher.Write(bytes)
	return hasher.Sum(nil)
}
