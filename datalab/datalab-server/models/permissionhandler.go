package models

import (
	"fmt"
)

type PermissionHandlerManager struct {
	handler PermissionHandler
}

func NewPermissionHandlerManager(handler PermissionHandler) *PermissionHandlerManager {
	return &PermissionHandlerManager{
		handler: handler,
	}
}

func (c *PermissionHandlerManager) GetPublic() bool {
	return c.handler.GetPublic()
}

func (c *PermissionHandlerManager) SavePermissionRoles(roles *PermissionRoles) (err error) {
	var existPermissions []*Permission
	manager := NewModelManager(Permission{})
	manager.All(&existPermissions)
	insertableUsers := []string{}
	insertableGroups := []string{}
	resourceType := c.handler.GetResourceType()
	resourceName := c.handler.GetResourceName()
	for _, user := range roles.AccessibleUsers {
		insertable := true
		for _, permission := range existPermissions {
			if permission.ResourceName == resourceName &&
				permission.ResourceType == resourceType &&
				permission.ResourceType == UserConstraint &&
				permission.ResourceName == user {
				insertable = false
			}
		}
		if insertable {
			insertableUsers = append(insertableUsers, user)
		}
	}
	for _, group := range roles.AccessibleGroups {
		insertable := true
		for _, permission := range existPermissions {
			if permission.ResourceName == resourceName &&
				permission.ResourceType == resourceType &&
				permission.ResourceType == GroupConstraint &&
				permission.ResourceName == group {
				insertable = false
			}
		}
		if insertable {
			insertableGroups = append(insertableGroups, group)
		}
	}
	for _, user := range insertableUsers {
		err = manager.Create(&Permission{
			ResourceType:   resourceType,
			ResourceName:   resourceName,
			ConstraintType: UserConstraint,
			ConstraintName: user,
		})
		if err != nil {
			return err
		}
	}
	for _, group := range insertableGroups {
		manager.Create(&Permission{
			ResourceType:   resourceType,
			ResourceName:   resourceName,
			ConstraintType: GroupConstraint,
			ConstraintName: group,
		})
		if err != nil {
			return err
		}
	}
	return err
}

func (c *PermissionHandlerManager) GetPermissionRoles(existPermissions []*Permission) *PermissionRoles {
	users := []string{}
	groups := []string{}
	resourceType := c.handler.GetResourceType()
	resourceName := c.handler.GetResourceName()
	for _, permission := range existPermissions {
		if permission.ResourceName == resourceName &&
			permission.ResourceType == resourceType {
			if permission.ConstraintType == UserConstraint {
				users = append(users, permission.ConstraintName)
			}
			if permission.ConstraintType == GroupConstraint {
				groups = append(groups, permission.ConstraintName)
			}
		}
	}
	return &PermissionRoles{
		AccessibleUsers:  users,
		AccessibleGroups: groups,
	}
}

func (c *PermissionHandlerManager) CheckPermissionRoles(existPermissions []*Permission, user User) bool {
	resourceType := c.handler.GetResourceType()
	resourceName := c.handler.GetResourceName()
	for _, permission := range existPermissions {
		if permission.ResourceName == resourceName &&
			permission.ResourceType == resourceType {
			if permission.ConstraintType == UserConstraint {
				if user.Username == permission.ConstraintName {
					return true
				}
			}
			if permission.ConstraintType == GroupConstraint {
				if user.Group == permission.ConstraintName {
					return true
				}
			}
		}
	}
	return false
}

func (c *PermissionHandlerManager) DeletePermissionRoles() (err error) {
	manager := NewModelManager(Permission{})
	resourceType := c.handler.GetResourceType()
	resourceName := c.handler.GetResourceName()
	err = manager.DeleteWhere("permission", fmt.Sprintf("resource_name='%s' AND resource_type='%s'", resourceName, resourceType))
	return err
}
