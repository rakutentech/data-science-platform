package auth

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"encoding/hex"
	"fmt"
	"strings"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	"github.com/astaxie/beego/logs"
)

type TokenManager struct{}

var commonIV = []byte{0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f}

func (complex *TokenManager) BuildUserToken(user models.User, tokenKey string) string {

	plaintext := []byte(fmt.Sprintf("%32s", user.Username))
	cp, err := aes.NewCipher([]byte(tokenKey))
	if err != nil {
		logs.Error(err.Error())
		return ""
	}

	cfb := cipher.NewCFBEncrypter(cp, commonIV)
	ciphertext := make([]byte, len(plaintext))
	cfb.XORKeyStream(ciphertext, plaintext)
	return hex.EncodeToString(ciphertext)
}

func (complex *TokenManager) FetchUserFromToken(token string, tokenKey string) *models.User {
	cp, err := aes.NewCipher([]byte(tokenKey))
	if err != nil {
		logs.Error(err.Error())
		return nil
	}
	cfbdec := cipher.NewCFBDecrypter(cp, commonIV)
	plaintextCopy := make([]byte, 256)
	data, err := hex.DecodeString(token)
	cfbdec.XORKeyStream(plaintextCopy, data)
	if err != nil {
		logs.Error(err.Error())
		return nil
	} else {
		var user models.User
		manager := models.NewModelManager(models.User{})
		err := manager.FindOne(map[string]interface{}{
			"username": strings.TrimSpace(string(bytes.Trim(plaintextCopy, "\x00"))),
		}, &user)
		user.Password = "" // Hide password information
		if err != nil {
			logs.Warn("Cannot decode user from token: ", err.Error())
		}
		return &user
	}

}
