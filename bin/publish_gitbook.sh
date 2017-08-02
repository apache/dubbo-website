#!/bin/bash
cd `dirname $0`
BIN_DIR=`pwd`
cd ..
DEPLOY_DIR=`pwd`
STATIC_TMP_DIR=$HOME/dubbo-docs-static-tmp

if [ ! -d "$STATIC_TMP_DIR" ] ; then
    git clone -b master https://github.com/dubbo/dubbo-docs.git $STATIC_TMP_DIR
fi

cd $DEPLOY_DIR/user-guide
gitbook build .
if [ ! -d "$STATIC_TMP_DIR/user-guide" ] ; then
    mkdir $STATIC_TMP_DIR/user-guide
fi
cp -rf ./_book/*  $STATIC_TMP_DIR/user-guide
rm -rf ./_book

cd $DEPLOY_DIR/developer-guide
gitbook build .
if [ ! -d "$STATIC_TMP_DIR/developer-guide" ] ; then
    mkdir $STATIC_TMP_DIR/developer-guide
fi
cp -rf ./_book/*  $STATIC_TMP_DIR/developer-guide
rm -rf ./_book

cd $DEPLOY_DIR/admin-guide
gitbook build .
if [ ! -d "$STATIC_TMP_DIR/admin-guide" ] ; then
    mkdir $STATIC_TMP_DIR/admin-guide
fi
cp -rf ./_book/*  $STATIC_TMP_DIR/admin-guide
rm -rf ./_book

cd $STATIC_TMP_DIR

filelist=`ls -1`
for filename in $filelist ; do
if [ -f "$filename" ] ; then
    echo $filename
    cp -rf ./$filename ./
elif [ -d "$filename" ] && [ ! "$filename" == "user-guide" -a ! "$filename" == "developer-guide" -a ! "$filename" == "admin-guide" ] ; then
   cp -rf ./$filename  ./
fi
done

git add .
git commit -m 'MISC:auto publish'
git push -u origin master

cd ~
rm -rf $STATIC_TMP_DIR
