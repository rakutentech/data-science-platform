package auth

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/utils"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/context"
	"github.com/astaxie/beego/logs"
	jwt "github.com/dgrijalva/jwt-go"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/app"
)

type AuthController struct {
	beego.Controller
}

const (
	ProfileKey = "profile"
	UserKey    = "user"
)

var tokenRegex = regexp.MustCompile(`Bearer +(?P<Token>[a-zA-Z0-9.\-_]+)$`)
var config = app.NewConfig() // read config file from conf/app.conf

func Authenticate(ctx *context.Context) {
	originalURL := ctx.Input.URL()
	method := ctx.Input.Method()
	if (originalURL == "/auth" || originalURL == fmt.Sprintf("%s/auth", app.GetConfig().Admin.URLPath)) && method == "POST" {
		return
	}
	authTokenString := ctx.Input.Header("Authorization")
	if len(authTokenString) > 0 {
		matchs := tokenRegex.FindStringSubmatch(authTokenString)
		if len(matchs) != 2 {
			logs.Warn(fmt.Sprintf("Token format is invaild: [%s]", authTokenString))
			ctx.ResponseWriter.WriteHeader(401)
			ctx.Output.Header("Content-Type", "application/json")
			ctx.ResponseWriter.Write([]byte("401 Unauthorized"))
		} else {
			authToken := matchs[1]

			var profile interface{}
			var err error
			if strings.HasPrefix(originalURL, app.GetConfig().Admin.URLPath) {
				_, err = ParseAdmin(authToken)
			} else {
				profile, err = ParseUser(authToken)
				if err != nil {
					user := new(TokenManager).FetchUserFromToken(authToken, app.GetConfig().TokenKey)
					if user != nil {
						err = nil
						ctx.Input.SetData(UserKey, *user)
					} else {
						logs.Error("Cannot parse user from token: %s", authToken)
					}
				} else {
					ctx.Input.SetData(UserKey, profile)
				}
			}
			if err != nil {
				logs.Warn(fmt.Sprintf("Unavailable token: %s", err.Error()))
				ctx.ResponseWriter.WriteHeader(401)
				ctx.Output.Header("Content-Type", "application/json")
				ctx.ResponseWriter.Write([]byte("401 Unauthorized"))
			}
		}
	} else {
		ctx.ResponseWriter.WriteHeader(401)
		ctx.Output.Header("Content-Type", "application/json")
		ctx.ResponseWriter.Write([]byte("401 Unauthorized"))
	}
	return

}

type LoginRequest struct {
	Username   string
	Password   string
	RememberMe bool
}

// Auth function
// @Title Auth
// @Description Authenticate user
// @Param	username	passowrd	rememberMe	string	string	bool		"body for user login content"
// @Success 200 {json} JWT token
// @Failure 403 body is empty
// @router / [post]
func (c *AuthController) Auth() {
	var request LoginRequest
	json.Unmarshal(c.Ctx.Input.RequestBody, &request)
	failedMessage := fmt.Sprintf("%s was sign in failed from %s, auth failed", request.Username, c.Ctx.Request.RemoteAddr)

	manager := models.NewModelManager(models.User{})
	var user models.User
	err := manager.FindOne(map[string]interface{}{
		"username": request.Username,
	}, &user)
	if err == nil {
		authenticator := NewAuthenticator(user)
		if authenticator.authenticate(request.Username, request.Password) {
			profle, _ := json.Marshal(user)
			token, err := GenerateJWT(string(profle), request.RememberMe, config.User.Key)
			if err != nil {
				logs.Error(err.Error())
				c.CustomAbort(403, utils.HTTPFailedJSONString(err.Error()))
			} else {
				logs.Info(fmt.Sprintf("%s was sign in success from %s, rememberMe=%v", request.Username, c.Ctx.Request.RemoteAddr, request.RememberMe))
				c.Data["json"] = map[string]string{
					"token": string(token),
				}
				c.ServeJSON()
			}
		} else {
			c.Data["json"] = utils.HTTPFailedJSON("user or password wrong")
			logs.Warning(failedMessage)
		}
	} else {
		logs.Error(failedMessage)
		c.CustomAbort(403, utils.HTTPFailedJSONString("Invaild username or password"))
	}
}

// AdminAuth function
// @Title Admin Auth
// @Description Authenticate admin
// @Param	username	passowrd	rememberMe	string	string	bool		"body for admin login content"
// @Success 200 {json} JWT token
// @Failure 403 body is empty
// @router / [post]
func (c *AuthController) AdminAuth() {
	var request LoginRequest
	json.Unmarshal(c.Ctx.Input.RequestBody, &request)
	c.ParseForm(&request)
	failedMessage := fmt.Sprintf("%s was sign in failed from %s, auth failed", request.Username, c.Ctx.Request.RemoteAddr)
	if request.Username == config.Admin.Name && request.Password == config.Admin.Password {
		token, err := GenerateJWT(request.Username, request.RememberMe, config.Admin.Key)
		if err != nil {
			logs.Error(err.Error())
			c.CustomAbort(403, utils.HTTPFailedJSONString(err.Error()))
		} else {
			logs.Info(fmt.Sprintf("%s was sign in success from %s, rememberMe=%v", request.Username, c.Ctx.Request.RemoteAddr, request.RememberMe))
			c.Data["json"] = map[string]string{
				"token": string(token),
			}
			c.ServeJSON()
		}
	} else {
		logs.Error(failedMessage)
		c.CustomAbort(403, utils.HTTPFailedJSONString("Invaild username or password"))
	}
}

func processError(err error, signedString string, token *jwt.Token) (string, error) {
	if err != nil {
		if ve, ok := err.(*jwt.ValidationError); ok {
			if ve.Errors&jwt.ValidationErrorExpired != 0 {
				return "", fmt.Errorf("%s is expired (%s)", signedString, err.Error())
			}
			return "", fmt.Errorf("%s is invalid (%s)", signedString, err.Error())
		}
		return "", fmt.Errorf("%s is invalid (%s)", signedString, err.Error())
	}

	if token == nil {
		return "", fmt.Errorf("not found token in %s", signedString)
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", fmt.Errorf("not found claims in %s", signedString)
	}
	data, ok := claims[ProfileKey].(string)
	if !ok {
		return "", fmt.Errorf("not found %s in %s", "profile", signedString)
	}

	return data, nil
}

func ParseAdmin(signedString string) (interface{}, error) {
	secret := config.Admin.Key
	token, err := jwt.Parse(signedString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return "", fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})
	return processError(err, signedString, token)
}

func ParseUser(signedString string) (interface{}, error) {
	secret := config.User.Key
	token, err := jwt.Parse(signedString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return "", fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	profile, err := processError(err, signedString, token)
	var user models.User
	if err == nil {
		json.Unmarshal([]byte(profile), &user)
		return user, err
	} else {
		return user, err
	}
}

func GenerateJWT(profile string, rememberMe bool, secret string) (string, error) {
	claims := jwt.MapClaims{}
	now := time.Now()
	claims[ProfileKey] = profile
	claims["iat"] = now
	if !rememberMe {
		claims["exp"] = time.Now().Add(app.GetConfig().User.LoginExpire).Unix()
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
