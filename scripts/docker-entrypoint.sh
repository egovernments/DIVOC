if [ ! -f .initialized ]; then
  echo "Initializing container"
  # run initializing commands
  sh /scripts/font-config.sh
  touch .initialized
else
  echo "Already initialized"
fi
echo "Starting the server"
npm start