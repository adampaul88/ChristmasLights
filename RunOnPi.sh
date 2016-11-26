PI_HOST=192.168.1.16
rsync -azP ./ root@$PI_HOST:app
echo "----------------------- finished syncing -----------------------"
ssh root@$PI_HOST "source ~/.profile; ./app/node_modules/mocha/bin/mocha ./app/test/unit"
