package test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"

	"github.com/astaxie/beego"
)

func IsSuccessAction(body []byte) bool {
	response := make(map[string]string)
	json.Unmarshal(body, &response)
	return response["status"] == "ok"
}

type RequestProxy struct {
	Username   string
	Password   string
	RememberMe bool
	Token      string
}

func (r *RequestProxy) Login(authPath string) bool {
	body := strings.NewReader(fmt.Sprintf(`{
		"username": "%s",
		"password": "%s",
		"rememberMe": %v
	}`, r.Username, r.Password, r.RememberMe))
	request, _ := http.NewRequest("POST", authPath, body)
	response := httptest.NewRecorder()
	beego.BeeApp.Handlers.ServeHTTP(response, request)
	if response.Code == 200 {
		var data map[string]string
		if err := json.Unmarshal(response.Body.Bytes(), &data); err != nil {
			log.Fatal(err)
			return false
		}
		r.Token = data["token"]
		return true
	}
	return false
}
func (r *RequestProxy) Get(path string) *httptest.ResponseRecorder {
	request, _ := http.NewRequest("GET", path, nil)
	request.Header.Add("Authorization", fmt.Sprintf("Bearer %s", r.Token))
	response := httptest.NewRecorder()
	beego.BeeApp.Handlers.ServeHTTP(response, request)
	return response
}

func (r *RequestProxy) Post(path string, jsonBody []byte) *httptest.ResponseRecorder {
	request, _ := http.NewRequest("POST", path, bytes.NewReader(jsonBody))
	request.Header.Add("Authorization", fmt.Sprintf("Bearer %s", r.Token))
	response := httptest.NewRecorder()
	beego.BeeApp.Handlers.ServeHTTP(response, request)
	return response
}

func (r *RequestProxy) Put(path string, jsonBody []byte) *httptest.ResponseRecorder {
	request, _ := http.NewRequest("PUT", path, bytes.NewReader(jsonBody))
	request.Header.Add("Authorization", fmt.Sprintf("Bearer %s", r.Token))
	response := httptest.NewRecorder()
	beego.BeeApp.Handlers.ServeHTTP(response, request)
	return response
}

func (r *RequestProxy) Delete(path string, jsonBody []byte) *httptest.ResponseRecorder {
	request, _ := http.NewRequest("DELETE", path, bytes.NewReader(jsonBody))
	request.Header.Add("Authorization", fmt.Sprintf("Bearer %s", r.Token))
	response := httptest.NewRecorder()
	beego.BeeApp.Handlers.ServeHTTP(response, request)
	return response
}
