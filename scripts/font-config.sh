#!/usr/bin/env sh
apk --no-cache add msttcorefonts-installer fontconfig
wget https://www.1001fonts.com/download/canterbury.zip
unzip canterbury.zip
install Canterbury.ttf /usr/share/fonts/truetype/
wget -O Nautigal.zip 'https://fonts.google.com/download?family=The%20Nautigal'
wget -O Imperial.zip 'https://fonts.google.com/download?family=Imperial%20Script'
unzip -o Nautigal.zip
unzip -o Imperial.zip
install TheNautigal-Regular.ttf /usr/share/fonts/truetype/
install ImperialScript-Regular.ttf /usr/share/fonts/truetype/
fc-cache -f && rm -rf /var/cache/*