import Taro, { Component, Config } from '@tarojs/taro'
import { View, Canvas, Image, Text, ScrollView } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import mapMark from '../../static/mapMark.png'
import './index.scss'
export default class Index extends Component {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '首页',    
  }

  state = {
    criticalRssi:-90,//更新信号强度
    changeImage:4,//更换潮井核心景区的景区序号
    inChaoJing:1,//是否在潮井核心景区（是否切换图片） 0在 
    interval:3,  //更新间隔（s）
    currentLocation:1,//现在所在的景点位置
    width:337,//手机屏幕宽度
    canvasLeft:0,//画布向左移动距离
    canvasHeight:640,//画布高度
    canvasWidth:1801,//画布长度  主景区
    chaoJingWidth:870.4,
    currentMac:"65535:1",//现在的mac地址
    touch: {
      startLocationX:0,
      startLocationY:0,
    }
  }
  componentWillMount() {
    var that = this;
    Taro.getSystemInfo({//获取手机信息，得到画布的高度和宽度
      success: function(res) {
        console.log(res)
        var height = res.windowHeight * 0.9
        var width = res.windowHeight*2.81
        var chaoWidth = res.windowHeight * 1.36
        console.log(height,width)
        that.setState({
          ...that.state,
          width:res.windowWidth,
          canvasHeight:height,
          canvasWidth:width,
          chaoJingWidth: chaoWidth,
        })
      }
    });
   }
  componentDidMount() { }
  context = Taro.createCanvasContext('canvas', this.$scope)
  coordinate = [//各个景点的坐标、画布位置及名称
    {

    },
    {
      "name":"荷花池",
      "location":1,
      "canvasLeft":1,//从右向左减去多少个屏幕宽度
      "mapMarkX":0.837,//从左向右的坐标比例
      "mapMarkY":0.495,
    },
    {
      "name":"湿地公园",
      "location":2,
      "canvasLeft":1.3,
      "mapMarkX":0.783,
      "mapMarkY":0.45,
    },
    {
      "name":"葫芦湖",
      "location":3,
      "canvasLeft":1.5,
      "mapMarkX":0.745,
      "mapMarkY":0.42,
    },
    {
      "name":"百顺桥",
      "location":4,
      "canvasLeft":3.8,
      "mapMarkX":0.246,
      "mapMarkY":0.3,
    },
    {
      "name":"潮井顺文化广场",
      "location":5,
      "canvasLeft":4.3,
      "mapMarkX":0.095,
      "mapMarkY":0.48,
    },
    {
      "name":"神泉潮井",
      "location":6,
      "canvasLeft":4.3,
      "mapMarkX":0.063,
      "mapMarkY":0.438,
    },
    {
      "name":"神泉驿站及神泉瀑布",
      "location":7,
      "canvasLeft":1.8,
      "mapMarkX":0.71,
      "mapMarkY":0.264,
    },
    {
      "name":"三七农场和桃花园",
      "location":8,
      "canvasLeft":2,
      "mapMarkX":0.652,
      "mapMarkY":0.09,
    },
    {
      "name":"画家村入口及画家村",
      "location":9,
      "canvasLeft":2.25,
      "mapMarkX":0.623,
      "mapMarkY":0.145,
    },
    {
      "name":"画家村服务中心",
      "location":10,
      "canvasLeft":1.9,
      "mapMarkX":0.659,
      "mapMarkY":0.178,
    },
    {
      "name":"滑草场",
      "location":11,
      "canvasLeft":2.45,
      "mapMarkX":0.571,
      "mapMarkY":0.139,
    },
    {
      "name":"紫薇林",
      "location":12,
      "canvasLeft":2.6,
      "mapMarkX":0.5269,
      "mapMarkY":0.218,
    },
    {//没有
      "name":"狸风塘瀑布",
      "location":13,
      "canvasLeft":2.6,
      "mapMarkX":0.5269,
      "mapMarkY":0.218,
    },
    {//没有
      "name":"红军桥及红军瀑布",
      "location":14,
      "canvasLeft":2.6,
      "mapMarkX":0.5269,
      "mapMarkY":0.218,
    },
    {
      "name":"粉黛草观赏区",
      "location":15,
      "canvasLeft":3.87,
      "mapMarkX":0.26,
      "mapMarkY":0.36,
    },
    {
      "name":"飞花驿站",
      "location":16,
      "canvasLeft":4,
      "mapMarkX":0.2,
      "mapMarkY":0.414,
    }

  ]
  scenicArea = {//景区mac对应的景区序号，"65535:1"对应coordinate中的1号
    "65535:1":16,
    "65535:2":16,
    "65535:3":16,
    "65535:4":16,
  }
  componentWillUnmount() {

  }
  compare(rssi) {//排序用函数
    return function(obj1,obj2) {
      let val1 = obj1[rssi];
      let val2 = obj2[rssi];
      if(val1 < val2) {
        return 1;
      } else if(val1 > val2) {
        return -1;
      } else {
        return 0;
      }
    }
  }
  componentDidShow() {
    var that = this;
    var beaconsTempArray : any[] = [];
    var info = {//基站的uuid
      uuids: ["fda50693-a4e2-4fb1-afcf-c6eb07647826"]
    };
    
    //监测蓝牙状态的改变
    // Taro.onBluetoothAdapterStateChange(function (res) {
    //   if (res.available) {//如果用户打开蓝牙，开始搜索IBeacon
    //     searchBeacon();
    //   }
    // })


    var flag = 1;
    Taro.startBeaconDiscovery(info).then(() => {//开始搜索附近的iBeacon设备
      Taro.onBeaconUpdate(function (res) {//监听 iBeacon 设备的更新事件  
        //封装请求数据 
        var beacons = res.beacons;
        for (var i = 0; i < beacons.length; i++) {
          if(beacons[i].accuracy != -1)
          {//基站更新函数，将一段时间内的ibeacon强度求平均值，
            flag = 1;
            let mac = that.scenicArea[`${beacons[i].major + ":" + beacons[i].minor}`];
            beaconsTempArray.forEach(item=> {
              if(item.mac == mac) {
                item.num ++;
                item.rssi += beacons[i].rssi;
                flag = 0;
              }
            })
            if(flag) {
              let bleObj = {
                rssi:0,
                mac:"",
                num:1
              };
              bleObj.rssi = beacons[i].rssi;
              bleObj.mac = that.scenicArea[`${beacons[i].major + ":" + beacons[i].minor}`];
              console.log(bleObj.mac);
              beaconsTempArray.push(bleObj);
            }
          }
        }
      });
    })
    setInterval(function() {//执行更新函数
      beaconsTempArray.forEach(item=> {
        item.rssi = item.rssi / item.num;
      })
      beaconsTempArray.sort(that.compare("rssi"));//对信号强度进行排序

      if(beaconsTempArray.length && beaconsTempArray[0].rssi > that.state.criticalRssi && that.state.currentLocation != that.coordinate[beaconsTempArray[0].mac].location)
      {
        //console.log(that.coordinate[that.scenicArea[`${beaconsTempArray[0].mac}`]].mapMarkX)
        var currentCanvasLeft = that.state.canvasWidth - that.coordinate[beaconsTempArray[0].mac].canvasLeft * that.state.width;
        currentCanvasLeft = -currentCanvasLeft;
        var ChaoJing = !(that.coordinate[beaconsTempArray[0].mac].location === 5 || that.coordinate[beaconsTempArray[0].mac].location === 4 || that.coordinate[beaconsTempArray[0].mac].location === 6)
        console.log(ChaoJing)
        console.log(currentCanvasLeft);
        //console.log(currentCanvasLeft);
        //console.log("changeLocation")
        var mapMarkx = that.state.canvasWidth * that.coordinate[beaconsTempArray[0].mac].mapMarkX
        var mapMarky = that.state.canvasHeight * that.coordinate[beaconsTempArray[0].mac].mapMarkY
        that.context.drawImage(mapMark, mapMarkx, mapMarky,70,70);
        that.context.draw();
        that.setState({
        ...that.state,
        inChaoJing: ChaoJing,
        canvasLeft:currentCanvasLeft,
        currentLocation:that.coordinate[beaconsTempArray[0].mac].location,
        currentMac:beaconsTempArray[0].mac,
        currentRssi:beaconsTempArray[0].Rssi
        })
      }
      beaconsTempArray = [];
    },this.state.interval*1000)
    function stopSearchBeacom() {
      Taro.stopBeaconDiscovery({
        success: function () {
          // searchBeacon();
        }
      })
    }
    this.context.setFillStyle('rgba(255, 255, 255, 0)')
    this.context.fill()
  }
  componentDidHide() { }
  touchMoveCallBack(e) {//手指移动回掉函数
    let x = e.changedTouches[0]["x"]
    let currentTouchX = this.state.touch["startLocationX"];
    let currentX = this.state.canvasLeft;
    let moveX = currentX + (x - currentTouchX)/10;
    if(moveX > 0) moveX = 0;
    if(this.state.inChaoJing && moveX < -(this.state.canvasWidth - this.state.width)) moveX = -(this.state.canvasWidth - this.state.width)
    if(!this.state.inChaoJing && moveX < -(this.state.chaoJingWidth - this.state.width)) moveX = -(this.state.chaoJingWidth - this.state.width)
    this.setState({
      ...this.state,
      canvasLeft:moveX,
    })
  }
  touchstartCallback(e) {//开始触摸时执行的函数，将触摸起始位置保存
    console.log(111);
    console.log(e)
    this.setState({
      ...this.state,
      touch:{
        ...this.state.touch,
        startLocationX:e.changedTouches[0]["x"],
        startLocationY:e.changedTouches[0]["y"]
      }
    })
  }
 
  render() {
    return (
      <View className='page' >
        <Canvas  
          className='canvas' 
          style="height:{{canvasHeight}}px;width:{{canvasWidth}}px;left:{{canvasLeft}}px;position:fixed;" 
          canvasId='canvas'
          onTouchStart={this.touchstartCallback}
          onTouchMove={this.touchMoveCallBack}
          >
          {this.state.inChaoJing 
          ? <Image  src= "cloud://test-70b991.7465-test-70b991/1.jpg" style= "height:{{canvasHeight}}px;width:{{canvasWidth}}px;"></Image>
          : <Image  src="https://7465-test-70b991-1258348028.tcb.qcloud.la/03chaojing.jpg?sign=c612f13f47f497c4550624fb614e05a0&t=1549161309" style="height:{{canvasHeight}}px;width:{{chaoJingWidth}}px;"></Image>
          }
        
        </Canvas> 
        <View className='introduction'>
          <View className='box1'></View>
          <View className="info">
            <View className='scenicName'>
              name of scenic Area;
              {this.scenicArea["65535:1"]}
            </View>
            <View className="details">查看详情</View>
          </View>
        </View>
      </View>

    )
  }
}

