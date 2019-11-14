package utils

import (
	"encoding/json"
	"os"
)

// HTTPSuccessJSON will get JSON format success data
func HTTPSuccessJSON() interface{} {
	return map[string]string{
		"status": "ok",
	}
}

// HTTPFailedJSON will get JSON format failed data
func HTTPFailedJSON(message string) interface{} {
	return map[string]string{
		"status":  "failed",
		"message": message,
	}
}

// HTTPFailedJSONString will get JSON format failed data as string
func HTTPFailedJSONString(message string) string {
	errorMessage, _ := json.Marshal(HTTPFailedJSON(message))
	return string(errorMessage)
}

func Keys(m map[string]int) []string {
	ks := []string{}
	for k, _ := range m {
		ks = append(ks, k)
	}
	return ks
}

// Map function
func Map(vs []string, f func(string) string) []string {
	vsm := make([]string, len(vs))
	for i, v := range vs {
		vsm[i] = f(v)
	}
	return vsm
}

// Container find  wheather a string exist in a array or not
func Contain(items []string, item string) bool {
	for _, v := range items {
		if v == item {
			return true
		}
	}
	return false
}

func ApplyFile(body []byte, path string) (err error) {
	_, err = os.Stat(path)
	if os.IsNotExist(err) {
		err = nil
	} else {
		err = os.Remove(path)
	}
	if err != nil {
		return err
	}
	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()
	_, err = file.Write(body)
	return err
}
