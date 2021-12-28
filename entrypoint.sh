#!/bin/bash

t_path=./translations

mkdir $t_path

cp ${INPUT_PATH_TO_FILES}/* $t_path

files=

main=./translations/en.json

for FILE in $(find $t_path -type f -name "*.json")
do
    if [[ $FILE = $t_path/$INPUT_MAIN_FILE ]]
    then
        main=$FILE
    else
        files=$files" "$FILE
    fi
done

echo Main file: $main
echo Checked files: $files

node /checkConfigs.js -m $main -f $files

funcsFiles=

for FILE in $(find . -type f -name "*.tsx")
do
    funcsFiles=$funcsFiles" "$FILE
done

node ./checkFuncs.js -m $main -f $funcsFiles
