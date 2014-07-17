#!/bin/bash
echo .idea > .gitignore

if [ -d .git/modules/ ]; then 
  rm -rf .git/modules/* 
fi

bash git-submodule.sh

`env -i`
git reset HEAD -- vendor
git checkout .gitignore

