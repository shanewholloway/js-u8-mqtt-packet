# u8-mqtt-packet test suite

For docker-based integ tests, invoke `npm -s run dkr_deps` to ensure backend integration services are running.

For localhost integ tests, ensure an MQTT service (like `mosquitto`) is running at `127.0.0.1:1883`.

If using `mosquitto` version 2, add `allow_anonymous true` to `mosquitto.conf` to allow unittests tests to run.  (This was previously the default in version 1.6)

