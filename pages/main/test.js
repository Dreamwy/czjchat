// pages/test/test.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  craeteDevice: function (e) {
    console.log(e.detail.value);
    wx.request({
      url: 'http://127.0.0.1:4002/api/device/create',
      data: {
        id: e.detail.value.deviceid,
        hotelid: e.detail.value.hotilid,
        room: e.detail.value.room,
        installman: e.detail.value.installman
      },
      // dataType: dataType,
      enableCache: true,
      enableHttp2: true,
      enableQuic: true,
      // header: header,
      method: "GET",
      responseType: "text",
      timeout: 0,
      success: (result) => {
        if(result.data.state == "success"){
          wx.showToast({
            title: "添加成功",
            duration: 1500,
            icon: "success"
          })
        }else{
          wx.showToast({
            title: result.data.errorMsg,
            duration: 1500,
            icon: "error"
          })
        }
        
        console.log(result)
      },
      fail: (res) => {
        console.log(res)
      },
      complete: (res) => {},
    })
  },

  placeDrder: function (e) {
    console.log(e.detail.value);
    wx.request({
      url: 'http://127.0.0.1:4002/api/order/create',
      data: {
        playerid: app.globalData.openid,
        deviceid: e.detail.value.deviceid,
        content: e.detail.value.content
      },
      // dataType: dataType,
      enableCache: true,
      enableHttp2: true,
      enableQuic: true,
      // header: header,
      method: "GET",
      responseType: "text",
      timeout: 0,
      success: (result) => {
        if(result.data.state == "success"){
          wx.showToast({
            title: "添加成功",
            duration: 1500,
            icon: "success"
          })
        }else{
          wx.showToast({
            title: result.data.errorMsg,
            duration: 1500,
            icon: "error"
          })
        }
        
        console.log(result)
      },
      fail: (res) => {
        console.log(res)
      },
      complete: (res) => {},
    })
  },
})