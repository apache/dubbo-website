#!/bin/sh

# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Determines the operating system.
OS="${TARGET_OS:-$(uname)}"
if [ "${OS}" = "Darwin" ] ; then
  OSEXT="darwin"
else
  OSEXT="linux"
fi

# Determine the latest Dubbo version by version number ignoring alpha, beta, and rc versions.
if [ "${DUBBO_VERSION}" = "" ] ; then
  DUBBO_VERSION="$(curl -sL https://github.com/dawnzzz/dubbo-kubernetes/releases | \
                  grep -E -o 'dubbo/([v,V]?)[0-9]*.[0-9]*.[0-9]*' | sort -V | \
                  tail -1 | awk -F'/' '{ print $2}')"
  DUBBO_VERSION="${DUBBO_VERSION##*/}"
fi

if [ "${DUBBO_VERSION}" = "" ] ; then
  printf "Unable to get latest Dubbo version. Set DUBBO_VERSION env var and re-run. For example: export DUBBO_VERSION=0.0.1\n"
  exit 1;
fi

LOCAL_ARCH=$(uname -m)
if [ "${TARGET_ARCH}" ]; then
    LOCAL_ARCH=${TARGET_ARCH}
fi

case "${LOCAL_ARCH}" in
  x86_64|amd64)
    DUBBO_ARCH=amd64
    ;;
  armv8*|aarch64*|arm64)
    DUBBO_ARCH=arm64
    ;;
  armv*)
    DUBBO_ARCH=armv7
    ;;
  *)
    echo "This system's architecture, ${LOCAL_ARCH}, isn't supported"
    exit 1
    ;;
esac

download_failed () {
  printf "Download failed, please make sure your DUBBO_VERSION is correct and verify the download URL exists!"
  exit 1
}

# Downloads the dubboctl binary archive.
tmp=$(mktemp -d /tmp/dubboctl.XXXXXX)
NAME="dubboctl-${DUBBO_VERSION}"

ARCH_URL="https://github.com/apache/dubbo-kubernetes/releases/download/dubbo%2F${DUBBO_VERSION}/dubbo-${DUBBO_VERSION}-${OSEXT}-${DUBBO_ARCH}.tar.gz"

with_arch() {
  printf "\nDownloading %s from %s ...\n" "${NAME}" "$ARCH_URL"
  if ! curl -o /dev/null -sIf "$ARCH_URL"; then
    printf "\n%s is not found, please specify a valid DUBBO_VERSION and TARGET_ARCH\n" "$ARCH_URL"
    exit 1
  fi
  filename="dubboctl-${DUBBO_VERSION}-${OSEXT}-${DUBBO_ARCH}.tar.gz"
  curl -fsL -o "${tmp}/${filename}" "$ARCH_URL"
  tar -xzf "${tmp}/${filename}" -C "${tmp}"
}

with_arch

printf "%s download complete!\n" "${filename}"

# setup dubboctl
mkdir -p "$HOME/.dubboctl/bin"
mv "${tmp}/dubboctl" "$HOME/.dubboctl/bin/dubboctl"
chmod +x "$HOME/.dubboctl/bin/dubboctl"
rm -r "${tmp}"

# Print message
printf "\n"
printf "Add the dubboctl to your path with:"
printf "\n"
printf "  export PATH=\$HOME/.dubboctl/bin:\$PATH \n"
printf "\n"
printf "Begin the Dubbo pre-installation check by running:\n"
printf "\t dubboctl x precheck \n"
printf "\n"
