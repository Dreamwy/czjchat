const app = getApp()

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
  // return String.fromCharCode.apply(null, new Uint16Array(buffer));
}


//十六进制转ASCII码
function hexCharCodeToStr(hexCharCodeStr) {
  var trimedStr = hexCharCodeStr.trim();
  var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
  var len = rawStr.length;
  if (len % 2 !== 0) {
    alert("存在非法字符!");
    return "";
  }
  var curCharCode;
  var resultStr = [];
  for (var i = 0; i < len; i = i + 2) {
    curCharCode = parseInt(rawStr.substr(i, 2), 16);
    resultStr.push(String.fromCharCode(curCharCode));
  }
  return resultStr.join("");
}


// 字符串转为ArrayBuffer对象，参数为字符串
// function str2ab(str) {
//   // var buf = new ArrayBuffer(str.length * 2); // 每个字符占用2个字节
//   var buf = new ArrayBuffer(22);
//   var bufView = new Uint16Array(buf);
//   // for (var i = 0, strLen = str.length; i < strLen; i++) {
//   //   bufView[i] = str.charCodeAt(i).toString(16);
//   // }
//   bufView[0] = 41
//   bufView[2] = 54
//   console.log(buf)
//   return buf;
// }

var bleData = ''
var bleStr = ''
Page({
  data: {
    devices: [],
    connected: false,
    chs: [],
  },
  onShow() {
    console.log('onShow监听页面显示');
  },

  onHide() {
    this.closeBLEConnection()
  },

  openBluetoothAdapter() {
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        this.startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        if (res.errCode === 10001) {
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              this.startBluetoothDevicesDiscovery()
            }
          })
        }
      }
    })
  },
  getBluetoothAdapterState() {
    wx.getBluetoothAdapterState({
      success: (res) => {
        console.log('getBluetoothAdapterState', res)
        if (res.discovering) {
          this.onBluetoothDeviceFound()
        } else if (res.available) {
          this.startBluetoothDevicesDiscovery()
        }
      }
    })
  },
  startBluetoothDevicesDiscovery() {
    if (this._discoveryStarted) {
      return
    }
    this._discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      success: (res) => {
        console.log('startBluetoothDevicesDiscovery success', res)
        this.onBluetoothDeviceFound()
      },
    })
  },
  stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery()
  },
  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        // if (device.deviceId != "DC:52:85:19:FF:CF") {
        //   return
        // }
        // if (!device.name && !device.localName) {
        //   return
        // }
        const foundDevices = this.data.devices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        if (idx === -1) {
          data[`devices[${foundDevices.length}]`] = device
        } else {
          data[`devices[${idx}]`] = device
        }
        this.setData(data)
      })
    })
  },
  createBLEConnection(e) {
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    const name = ds.name
    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        this.setData({
          connected: true,
          name,
          deviceId,
        })
        this.getBLEDeviceServices(deviceId)
      }
    })
    this.stopBluetoothDevicesDiscovery()
  },
  closeBLEConnection() {
    wx.closeBLEConnection({
      deviceId: this.data.deviceId
    })
    this.setData({
      connected: false,
      chs: [],
      canWrite: false,
    })
  },
  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        console.log("!!!!!", res.services)
        // this.getBLEDeviceCharacteristics(deviceId, '0000181C-0000-1000-8000-00805F9B34FB')
        this.getBLEDeviceCharacteristics(deviceId, 'EFCDAB89-6745-2301-EFCD-AB8967452301')
        // for (let i = 0; i < res.services.length; i++) {
        //   if (res.services[i].isPrimary) {
        //     this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
        //     return
        //   }
        // }
      }
    })
  },
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          if (item.properties.read) {
            wx.readBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
            })
          }
          if (item.properties.write) {
            this.setData({
              canWrite: true
            })
            this._deviceId = deviceId
            this._serviceId = serviceId
            this._characteristicId = item.uuid
            // this.writeBLECharacteristicValue()
          }
          if (item.properties.notify || item.properties.indicate) {
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
              success: (res) => {
                console.log('开启notify成功' + this._characteristicId)
              }
            })
          }
        }
      },
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })
  },
  writeBLECharacteristicValue(event) {
    var command = 'AT+061R1='
    
    switch (parseInt(event.currentTarget.dataset.command)) {
      case 1:
        command = 'AT+061R1='
        break;
      case 2:
        command = 'AT+061R2='
        break;
      case 22:
        command = 'AT+081W2=aa'
        break;
      case 5:
        command = 'AT+061R5='
        break;
      case 6:
        command = 'AT+071W6=0'
        break;
      default:
        break;
    }

    console.log(command)
    var buffer = str2ab(command)
    wx.writeBLECharacteristicValue({
      deviceId: this._deviceId,
      serviceId: this._serviceId,
      characteristicId: this._characteristicId,
      value: buffer,
      success: (res) =>{
        console.log("!!!!!write成功")
        wx.onBLECharacteristicValueChange((characteristic) => {
          console.log(ab2hex(characteristic.value))
          if (characteristic.value.byteLength > 0) {
            this.formdBLEData(ab2hex(characteristic.value))
          }
        })
        // wx.readBLECharacteristicValue({
        //   deviceId: that._deviceId,
        //   serviceId: that._serviceId,
        //   characteristicId: that._characteristicId,
        //   success: (res) => {
        //     console.log('读取数据成功')
        //     // 操作之前先监听，保证第一时间获取数据
        //   }
        // })
      }
    })
  },
  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter()
    this._discoveryStarted = false
  },
  formdBLEData(data) {
    if (data.search('41542b') != -1) {
      bleData = data
    } else if (data.search('aedc') != -1) {
      bleData = bleData.concat(data)
      this.processBLEData(bleData)
    } else {
      bleData = bleData.concat(data)
    }
  },
  processBLEData(data) {
    console.log(hexCharCodeToStr(data))
  }
})

function str2ab(str) {
  // var data = [0x41, 0x54, 0x2b,0x30,0x36,0x31,0x52,0x31,0x3d,0x0d,0x0a];
  var buf = new ArrayBuffer(str.length + 2);
  var dataView = new DataView(buf);
  var strs = str.split("");
  var i = 0;
  for (i; i < strs.length; i++) {
    dataView.setUint8(i, strs[i].charCodeAt());
  }
  dataView.setUint8(i, 0x0d)
  dataView.setUint8(i + 1, 0x0a)
  console.log(buf)
  return buf
}