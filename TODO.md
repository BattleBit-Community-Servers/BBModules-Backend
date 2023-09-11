

- add download
  => SEEMS GOOD, download count works
  - add permission for admins & owners
  
- add things to GetModules :
  - permissions / owner
  => filter is good, display all versions for a module if owner, display everything if mod or admin !!!! doesn't return owned non validated versions !!!!
  - pagination
  => perfect 5 atm, can be changed

- add admin/mods things :
  - review module
    - reviewmodule
    - getmodule => admins/mods part
  - add ban
  => working, admin can ban user, and the user can't connect
  - add lock
  =$> semi working : the admin can lock user, but user can post

- finish patch sessions permissions & auth
  => LOOKS GOOD BABY 

- improve routes autoloader
  => LOOKS GOOD BABY, error handling, better terminal logging

- make terminal look pretty
  => GORGEOUS CUTIE !

- make module deletion => add "in review" and "deleted" db fields

- add logout (clear session)
  => OK

- make sure that's the last iteration of prisma schema

- finish jsdoc


- backend verif :
 exec dotnet efzf.dll /path/to/thing




 + LATER
 - generate random tokens for each module or version by the owner to share until verified