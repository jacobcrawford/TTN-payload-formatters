function Decoder(input,port){
  function getHex(val)
  {
    if (val.startsWith('0x') || val.startsWith('0X'))
    {
        val = val.substring(2); //get rid of starting '0x'
    }

    var numBytes = val.length / 2;
    var bytes = [];

    for (var i = 0; i < numBytes; i++)
    {
        bytes.push(parseInt(val.substring(i*2, (i*2) + 2), 16));
    }
    
    return bytes;
  }
  
  function decode(bytes, port)
  {
    // Decode an uplink message from a buffer
    // (array) of bytes to an object of fields.
    var decoded = {};

    if (bytes == null){
        console.log("bytes are null");
        return null;
    }
    if (port === 1)
    {
      if (bytes.length != 11){
        console.log("bytes did not have length 11")
        return null;
      }
      decoded.type = "position";
      
      decoded.latitudeDeg = bytes[0] + bytes[1] * 256 + bytes[2] * 65536 + bytes[3] * 16777216;
      if (decoded.latitudeDeg >= 0x80000000)
        decoded.latitudeDeg -= 0x100000000;
      decoded.latitudeDeg /= 1e7;
        
      decoded.longitudeDeg = bytes[4] + bytes[5] * 256 + bytes[6] * 65536 + bytes[7] * 16777216;
      if (decoded.longitudeDeg >= 0x80000000)
        decoded.longitudeDeg -= 0x100000000;
      decoded.longitudeDeg /= 1e7;
        
      decoded.inTrip = ((bytes[8] & 0x1) !== 0) ? true : false;
      decoded.fixFailed = ((bytes[8] & 0x2) !== 0) ? true : false;
      decoded.manDown = ((bytes[8] & 0x4) !== 0) ? true : false;
      
      decoded.headingDeg = (bytes[9] & 0x7) * 45;
      decoded.speedKmph = (bytes[9] >> 3) * 5;
      
      decoded.batV = bytes[10] * 0.025;
    }
    else if (port === 2)
    {
      if (bytes.length != 3)
          return null;
        
      decoded.type = "downlink ack";
      
      decoded.sequence = (bytes[0] & 0x7F);
      decoded.accepted = ((bytes[0] & 0x80) !== 0) ? true : false;
      decoded.fwMaj = bytes[1];
      decoded.fwMin = bytes[2];
    }
    else if (port === 3)
    {
      if (bytes.length != 11)
        return null;
        
      decoded.type = "stats";
      
      decoded.initialBatV    = (((bytes[0] & 0xF) !== 0) ? (4.0 + (bytes[0] & 0xF) * 0.100) : null);
      decoded.txCount        =  32 * ((bytes[0] >> 4) + (bytes[1]  & 0x7F) *  16);
      decoded.tripCount      =  32 * ((bytes[1] >> 7) + (bytes[2]  & 0xFF) *   2
                                                      + (bytes[3]  & 0x0F) * 512);
      decoded.gpsSuccesses   =  32 * ((bytes[3] >> 4) + (bytes[4]  & 0x3F) *  16);
      decoded.gpsFails       =  32 * ((bytes[4] >> 6) + (bytes[5]  & 0x3F) *   4);
      decoded.aveGpsFixS     =   1 * ((bytes[5] >> 6) + (bytes[6]  & 0x7F) *   4);
      decoded.aveGpsFailS    =   1 * ((bytes[6] >> 7) + (bytes[7]  & 0xFF) *   2);
      decoded.aveGpsFreshenS =   1 * ((bytes[7] >> 8) + (bytes[8]  & 0xFF) *   1);
      decoded.wakeupsPerTrip =   1 * ((bytes[8] >> 8) + (bytes[9]  & 0x7F) *   1);
      decoded.uptimeWeeks    =   1 * ((bytes[9] >> 7) + (bytes[10] & 0xFF) *   2);
    }

    return decoded;
  }
  return decode(getHex(input),port)
}

console.log(Decoder("4E3F697D2101B4996478F2",1))

result = {
    "type": "position",
    "latitudeDeg": 210.4049486,
    "longitudeDeg": -171.6256479,
    "inTrip": false,
    "fixFailed": false,
    "manDown": true,
    "headingDeg": 0,
    "speedKmph": 75,
    "batV": 6.050000000000001
  }