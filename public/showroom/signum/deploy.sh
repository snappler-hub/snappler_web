#!/bin/bash

echo "Limpiando la carpeta vendor"
rm -rf vendor
./install_vendor.sh

echo "Limpiando la carpeta export"
rm -rf export

echo "Creando la nueva copia en export"
rsync -a --exclude='export' --exclude='.gitignore' --exclude='.gitmodules' --exclude='git-submodule.sh' --exclude='install_vendor.sh' --exclude='remove_git_submodule_repo.sh' . export

echo "Se borraran los siguientes directorios"
echo
find export -name ".git"
echo
read -p "[Confirmacion] Estas seguro? [s/n]" -n 1 -r
echo
if [[ $REPLY =~ ^[s]$ ]]
then
  find export -name ".git" | xargs rm -rf
fi
echo
