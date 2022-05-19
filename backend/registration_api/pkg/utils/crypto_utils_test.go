package utils

import (
	"crypto/rand"
	"encoding/hex"
	"testing"
)

func TestSymmetricEncrypt(t *testing.T) {
	bytes := make([]byte, 32) //generate a random 32 byte key for AES-256
	if _, err := rand.Read(bytes); err != nil {
		panic(err.Error())
	}
	type args struct {
		stringToEncrypt string
		keyString string
	}
	tests := []struct {
		name string
		args args
		want string
	}{
		{
			name: "shouldEncrypt",
			args: args{
				"{\"abc\":\"def\"}",
				hex.EncodeToString(bytes),
			},
			want: "bd4eea8dddcb650aa1f39329e09508c3c0831db54fe424d248bbb45201e2037c885bf3837c31f913db",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := ""
			if got = symmetricEncrypt(tt.args.stringToEncrypt, tt.args.keyString); symmetricDecrypt(got, tt.args.keyString) != tt.args.stringToEncrypt {
				t.Errorf("symmetricEncrypt() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestASymmetricEncryptionDecryption(t *testing.T) {
	// dummy keys for testing
	publicKeyString := "-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAybhBSTQDzw0/Eo9/B+XUpJYkmZZpumDqinzyeVjG2PameS8fA6A6+UPx9dQ56ItCJPPQa65s1A1FL7bs9G8jNKIsP6pkKZ0WRnAWdt4B//bwskT1koaoZXPcJlHzIDbRKlm8UkJRiuiU64lebcVttRYeOh2b6AJUt3+L/AVt3X0fP+hoMiynSqRU10oxKBDJsmWUYebu2lMpgnTtYLa+8GV85rLwnvi7IcEt7mgjFEPMobFT7biy/vWR5qF3Kzr40utKMpgch8hSveZz+rl51vZ+wLbBRJYMWJKYdcW1/KMPpMEavt0Dv5a7NtM7TEngv71CMORyXxXmobW02gMRgAt0TNBGjCE3fR8TbXPm7EIgDljTeBA/GnmakNYEglSq9YTnh2ROz6jvrd+iYYByg388j+K0kHh9tQNoWDX8L2yrSrBNpJL3EJ44Mshytjj7blmpUXg72G/We6a2HYDdfrZt/xZvcaj/rh1qG3CUSUru/KbLzIxUUwEolSIfEOfy8faETHhis0rRuSfosTgdgnf5YPGjl9AHNM4ZHGY9anUJNHhIU1JodHZlMwEVgNZEPTpX67jyf+OadHKqUVS1EGSp4RawvmEsPDg56NyF0sjopgsDbRregF7f6ltGV9tM+7KCN3S0bcVBiGqJ8EnDXFBRPrrtGuYaN2mV9vFLHY8CAwEAAQ==\n-----END PUBLIC KEY-----"
	privateKeyPem := "-----BEGIN PRIVATE KEY-----\n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 GnEg4hAWcUpapOWBA4lhzKGcBZ2TPw==\n-----END PRIVATE KEY-----";

	type args struct {
		stringToEncrypt string
		publicKeyPem string
	}
	tests := []struct {
		name string
		args args
		want string
	}{
		{
			name: "shouldEncrypt",
			args: args{
				"abc1234",
				publicKeyString,
			},
			want: "abc1234",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := ""
			decryptedString := ""
			var err error
			if got, err = asymmetricEncrypt(tt.args.stringToEncrypt, tt.args.publicKeyPem); err != nil {
				t.Errorf("symmetricEncrypt() throwed error %v", err)
			}
			if decryptedString, err = asymmetricDecrypt(got, privateKeyPem); err != nil {
				t.Errorf("asymmetricDecrypt() throwed error %v", err)
			}
			if decryptedString != tt.want {
				t.Errorf("symmetricEncrypt() = %v, want %v", got, tt.want)
			}

		})
	}
}

