package models

import (
	crand "crypto/rand"
	"fmt"
	"math/rand"
	"reflect"
	"strings"
	"time"
)

const keyLength = 10

// secureRandomString is for avoiding uuid conflict
func secureRandomString(n int) string {
	k := make([]byte, n)
	if _, err := crand.Read(k); err != nil {
		panic(err)
	}
	return fmt.Sprintf("%x", k)
}

// GenerateUUID
// UUID format  type[:10]-owner[:10[-name[:10]-timestampe-rand[6]
func GenerateUUID(target interface{}, targetName, username string) string {
	rand.Seed(time.Now().UTC().UnixNano())
	targetType := reflect.TypeOf(target).Name()
	if len(targetType) > keyLength {
		targetType = targetType[:keyLength]
	}
	if len(username) > keyLength {
		username = username[:keyLength]
	}
	if len(targetName) > keyLength {
		targetName = targetName[:keyLength]
	}
	//DNS-1123 subdomain must consist of lower case alphanumeric characters
	return strings.Replace(
		strings.ToLower(fmt.Sprintf("%s-%s-%s-%d-%s", targetType, username, targetName, time.Now().Unix(), secureRandomString(3))),
		".",
		"-",
		-1)
}
