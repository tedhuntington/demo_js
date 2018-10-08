load('api_config.js');
load('api_gpio.js');
load('api_shadow.js');
load('api_timer.js');
load('api_sys.js');

// Load Mongoose OS API
load('api_arduino_bme280.js');
load('api_arduino_sgp30.js');

let led = Cfg.get('board.led1.pin');           // Built-in LED GPIO number
let onhi = Cfg.get('board.led1.active_high');  // LED on when high?
let state = {on: false};  // Device state - LED on/off status


// Sensors address (Usually: 0x76 or 0x77)
let sens_addr = 0x77;

print('Initialize BME');
let bme = Adafruit_BME280.createI2C(sens_addr);

if (bme === undefined) {
    print('Cant find a sensor');
} else {
  print('Initialize BME: success');
}  


let sgp = Adafruit_SGP30.createI2C();
 if (! sgp.begin()){
    print('Sensor not found :(');
  } else {
    print('Found SGP30 serial #');
    print(sgp.serialnumber[0]);
    print(sgp.serialnumber[1]);
    print(sgp.serialnumber[2]);
  } 

// Set up Shadow handler to synchronise device state with the shadow state
Shadow.addHandler(function(event, obj) {
  if (event === 'CONNECTED') {
    print('Connected to the device shadow');


// To use SPI instead of I2C, remove the above line and use one of the following:
// let bme = Adafruit_BME280.createSPI(cspin)
//      or
// let bme = Adafruit_BME280.createSPIFull(cspin, mosipin, misopin, sckpin)
//
//  let temp = {temp: bme.readTemperature()};

//if (bme === undefined) {
// Initialize Adafruit_BME280 library using the I2C interface
  

//    print('Cant find a sensor');
//} else {
//  print('Initialize BME: success');
  // This function reads data from the BME280 sensor every 2 seconds
  //Timer.set(2000 /* milliseconds */, true /* repeat */, function() {
    //print('Temperature:', bme.readTemperature(), '*C');
  //  print('Humidity:', bme.readHumidity(), '%RH');
  //  print('Pressure:', bme.readPressure(), 'hPa');
  //}, null);
  
//}


    print('  Reporting our current state..');
    Shadow.update(0, state);  // Report current state. This may generate the
                              // delta on the cloud, in which case the
                              // cloud will send UPDATE_DELTA to us

  //  Shadow.update(0, bme);
    print('  Setting up timer to periodically report metrics..');
    //print('Temperature:', bme.readTemperature(), '*C');
    Timer.set(10000, Timer.REPEAT, function() {
      let update = {uptime: Sys.uptime()};
      let temp = {temperature: bme.readTemperature()};
      let humidity = {humidity: bme.readHumidity()};
      let pressure = {pressure: bme.readPressure()};
      //let temp = {temp: Sys.uptime()};
      //print('Initialize BME');
      //let bme = Adafruit_BME280.createI2C(sens_addr);

      //print('Temperature:', bme.readTemperature(), '*C');      
      //print('Humidity:', bme.readHumidity(), '%RH');
      //print('Pressure:', bme.readPressure(), 'hPa');
  
      //let temp = {temp: bme.readTemperature()};
  
  
      //let update = {uptime: bme.readTemperature()};
      //let update = {uptime: "test"};
      //let update = {uptime: bme.readTemperature()};
      
      print(JSON.stringify(update));
      //print(JSON.stringify(temp));

      Shadow.update(0, update);  // Set uptime in seconds in the shadow
      Shadow.update(0, temp);  // Set temp in the shadow
      Shadow.update(0, humidity);  // Set temp in the shadow
      Shadow.update(0, pressure);  // Set temp in the shadow

    }, null);

  } else if (event === 'UPDATE_DELTA') {
    print('GOT DELTA:', JSON.stringify(obj));
    for (let key in obj) {  // Iterate over all keys in delta
      if (key === 'on') {   // We know about the 'on' key. Handle it!
        state.on = obj.on;  // Synchronise the state
        let level = onhi ? state.on : !state.on;
        GPIO.set_mode(led, GPIO.MODE_OUTPUT);  // And turn on/off the LED
        GPIO.write(led, level);                // according to the delta
        print('LED on ->', state.on);
      } else {
        print('Dont know how to handle key', key);
      }
    }
    Shadow.update(0, state);  // Report our new state, hopefully clearing delta
  }

/*  
    if (bme === undefined) {
    print('Cant find a sensor');
} 
    print('Temperature:', bme.readTemperature(), '*C');
    print('Humidity:', bme.readHumidity(), '%RH');
    print('Pressure:', bme.readPressure(), 'hPa');
*/
}

);
