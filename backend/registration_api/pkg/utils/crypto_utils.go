package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"github.com/gospotcheck/jwt-go"
	log "github.com/sirupsen/logrus"
	"io"
	"strings"
)

func GenSecKey() string {
	bytes := make([]byte, 32) //generate a random 32 byte key for AES-256
	if _, err := rand.Read(bytes); err != nil {
		panic(err.Error())
	}

	key := hex.EncodeToString(bytes) //encode key in bytes to string and keep as secret, put in a vault
	fmt.Printf("key to encrypt/decrypt : %s\n", key)
	return key
}

func SymmetricEncrypt(stringToEncrypt string, keyString string) (encryptedString string) {

	//Since the key is in string, we need to convert decode it to bytes
	key, _ := hex.DecodeString(keyString)
	plaintext := []byte(stringToEncrypt)

	//Create a new Cipher Block from the key
	block, err := aes.NewCipher(key)
	if err != nil {
		panic(err.Error())
	}

	//Create a new GCM - https://en.wikipedia.org/wiki/Galois/Counter_Mode
	//https://golang.org/pkg/crypto/cipher/#NewGCM
	aesGCM, err := cipher.NewGCM(block)
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
	ciphertext := aesGCM.Seal(nonce, nonce, plaintext, nil)

	return fmt.Sprintf("%x", ciphertext)
}

func SymmetricDecrypt(encryptedString string, keyString string) (decryptedString string) {

	key, _ := hex.DecodeString(keyString)
	enc, _ := hex.DecodeString(encryptedString)

	//Create a new Cipher Block from the key
	block, err := aes.NewCipher(key)
	if err != nil {
		panic(err.Error())
	}

	//Create a new GCM
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		panic(err.Error())
	}

	//Get the nonce size
	nonceSize := aesGCM.NonceSize()

	//Extract the nonce from the encrypted data
	nonce, ciphertext := enc[:nonceSize], enc[nonceSize:]

	//Decrypt the data
	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		panic(err.Error())
	}

	return fmt.Sprintf("%s", plaintext)
}

func AsymmetricEncrypt(stringToEncrypt string, publicKey string) (encryptedString string, err error) {

	plaintext := []byte(stringToEncrypt)
	publicKeyFromPem, err := jwt.ParseRSAPublicKeyFromPEM([]byte(publicKey))

	encryptedData, err := rsa.EncryptOAEP(sha256.New(), rand.Reader,publicKeyFromPem, plaintext, nil)
	if err != nil {
		log.Errorf("Error during asymmetric encrypt - %v", err)
		return "", err
	}

	return base64.StdEncoding.EncodeToString(encryptedData), nil
}

func AsymmetricDecrypt(encryptedString string, privateKey string) (decryptedString string, err error) {
	base64DecodeBytes, err := base64.StdEncoding.DecodeString(encryptedString)
	if err != nil {
		log.Errorf("Error in asymmetric encryption - ")
		return "", err
	}

	keyFromPem, _ := jwt.ParseRSAPrivateKeyFromPEM([]byte(privateKey))

	decryptedData, decryptErr := rsa.DecryptOAEP(sha256.New(), rand.Reader, keyFromPem, base64DecodeBytes, nil)
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
