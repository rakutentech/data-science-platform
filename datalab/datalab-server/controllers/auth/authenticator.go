package auth

import (
	"fmt"
	"strings"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/app"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	"github.com/astaxie/beego/logs"
	"gopkg.in/ldap.v2"
)

func NewAuthenticator(user models.User) Authenticator {
	switch user.AuthType {
	case models.LDAPAuthenticator:
		return &LDAPAuthenticator{
			user: user,
		}
	case models.DatabaseAuthenticator:
		fallthrough
	default:
		return &DatabaseAuthenticator{
			user: user,
		}
	}
}

type Authenticator interface {
	authenticate(username, password string) bool
}

type LDAPAuthenticator struct {
	user models.User
}

type DatabaseAuthenticator struct {
	user models.User
}

func (this *LDAPAuthenticator) authenticate(username, password string) bool {
	ldapServer := app.GetConfig().User.LDAPServer
	ldapPort := app.GetConfig().User.LDAPPort
	conn, err := ldap.Dial("tcp", fmt.Sprintf("%s:%d", ldapServer, ldapPort))

	if len(username) == 0 || len(password) == 0 {
		logs.Error("Empty username of password")
		return false
	}

	if err != nil {
		logs.Error("Failed to connect. %s", err)
		return false
	}

	if err := conn.Bind(app.GetConfig().User.LDAPBindUser, app.GetConfig().User.LDAPBindPassword); err != nil {
		logs.Error("Failed to bind [%s:%s]. %s", app.GetConfig().User.LDAPBindUser, app.GetConfig().User.LDAPBindPassword, err)
		return false
	}
	defer conn.Close()

	filterDN := strings.Replace(
		app.GetConfig().User.LDAPFilterDN,
		"{username}",
		username,
		-1,
	)
	result, err := conn.Search(ldap.NewSearchRequest(
		app.GetConfig().User.LDAPBaseDN,
		ldap.ScopeWholeSubtree,
		ldap.NeverDerefAliases,
		0,
		0,
		false,
		filterDN,
		[]string{"dn"},
		nil,
	))

	if err != nil {
		logs.Debug("Failed to find user. %s", err)
		return false
	}

	if len(result.Entries) < 1 {
		logs.Debug("User does not exist")
		return false
	}

	if len(result.Entries) > 1 {
		logs.Debug("Too many entries returned")
		return false
	}
	if err := conn.Bind(result.Entries[0].DN, password); err != nil {
		logs.Debug("Failed to auth. %s", err)
		return false
	} else {
		return true
	}
}

func (this *DatabaseAuthenticator) authenticate(username, password string) bool {
	return this.user.Username == username && this.user.Password == password
}
