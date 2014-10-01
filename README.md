qvedx
=====

Node Module for triggering EDX Tasks in QlikView (QMS API)

# Installation

    npm install pomalbisser/qvedx

## Example:

    var winGroups = require('win-groups');

	var username = process.env.username;
	var domain = process.env.userdomain;
	var group = 'Users';

    winGroups.isGroupMember({user: username, domain: domain, group: group}, function(err,isGroupMember){
      if(err)
        return console.log(err);

      console.log('Is in group:', isGroupMember);
    });

> Note: This would test whether the currently logged on user is part of the Users group.
> Windows 8: This does not seem to work on Win8 anymore though since the users are not in automatically part of the Users group anymore.. 

# Features
- domain support
- check if account name belongs to a specific group (isGroupMember)
- add member to a group (addGroupMember)
- remove member from a group (deleteGroupMember)
- get all members of a group (getGroupMembers)
