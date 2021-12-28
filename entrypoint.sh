#!/bin/bash

t_path=./translations

mkdir $t_path

cp ${INPUT_PATH_TO_FILES}/* $t_path

files=

main=

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

for FILE in $(grep -l [[:space:]*\{\.\[]t\([\"\'].*[\"\']\) $(find ./src -iregex ".*\.[t|j]sx?"))
do
    funcsFiles=$funcsFiles" "$FILE
done
    echo $funcsFiles

node /checkFuncs.js -m $main -f $funcsFiles
