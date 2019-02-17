import Taro, { Component, Config } from '@tarojs/taro'
import { View, Canvas, Image, Button} from '@tarojs/components'

import mapMark from '../../static/mapMark.png'
import './index.scss'
import Fly from 'flyio/dist/npm/wx'
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
    interval:5,  //更新间隔（s）
    currentLocation:1,//现在所在的景点位置
    width:337,//手机屏幕宽度
    canvasLeft:0,//画布向左移动距离
    canvasHeight:640,//画布高度
    canvasWidth:1801,//画布长度  主景区
    chaoJingWidth:870.4,
    touch: {
      startLocationX:0,
      startLocationY:0,
    }
  }
  const fly=new Fly;
  componentWillMount() {
    
    var that = this;
    Taro.getSystemInfo({//获取手机信息，得到画布的高度和宽度
      success: function(res) {
        console.log(res)
        var height = res.windowHeight * 0.85
        var width = height*2.5337837838
        that.setState({
          ...that.state,
          width:res.windowWidth,
          canvasHeight:height,
          canvasWidth:width,
        })
      }
    });
    this.fly.get("http://39.98.84.18/api/attraction/").then(d => {
      this.coordinate.pop()
      this.coordinate.push.apply(this.coordinate,d["data"])
      console.log(this.coordinate)
      console.log(that.coordinate[2].area["coordinates"])
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
    // {
    //   "name":"湿地公园",
    //   "location":2,
    //   "canvasLeft":1.3,
    //   "mapMarkX":0.783,
    //   "mapMarkY":0.45,
    // },
    // {
    //   "name":"葫芦湖",
    //   "location":3,
    //   "canvasLeft":1.5,
    //   "mapMarkX":0.745,
    //   "mapMarkY":0.42,
    // },
    // {
    //   "name":"百顺桥",
    //   "location":4,
    //   "canvasLeft":3.8,
    //   "mapMarkX":0.246,
    //   "mapMarkY":0.3,
    // },
    // {
    //   "name":"潮井顺文化广场",
    //   "location":5,
    //   "canvasLeft":4.3,
    //   "mapMarkX":0.095,
    //   "mapMarkY":0.48,
    // },
    // {
    //   "name":"神泉潮井",
    //   "location":6,
    //   "canvasLeft":4.3,
    //   "mapMarkX":0.063,
    //   "mapMarkY":0.438,
    // },
    // {
    //   "name":"神泉驿站及神泉瀑布",
    //   "location":7,
    //   "canvasLeft":1.8,
    //   "mapMarkX":0.71,
    //   "mapMarkY":0.264,
    // },
    // {
    //   "name":"三七农场和桃花园",
    //   "location":8,
    //   "canvasLeft":2,
    //   "mapMarkX":0.652,
    //   "mapMarkY":0.09,
    // },
    // {
    //   "name":"画家村入口及画家村",
    //   "location":9,
    //   "canvasLeft":2.25,
    //   "mapMarkX":0.623,
    //   "mapMarkY":0.145,
    // },
    // {
    //   "name":"画家村服务中心",
    //   "location":10,
    //   "canvasLeft":1.9,
    //   "mapMarkX":0.659,
    //   "mapMarkY":0.178,
    // },
    // {
    //   "name":"滑草场",
    //   "location":11,
    //   "canvasLeft":2.45,
    //   "mapMarkX":0.571,
    //   "mapMarkY":0.139,
    // },
    // {
    //   "name":"紫薇林",
    //   "location":12,
    //   "canvasLeft":2.6,
    //   "mapMarkX":0.5269,
    //   "mapMarkY":0.218,
    // },
    // {//没有
    //   "name":"狸风塘瀑布",
    //   "location":13,
    //   "canvasLeft":2.6,
    //   "mapMarkX":0.5269,
    //   "mapMarkY":0.218,
    // },
    // {//没有
    //   "name":"红军桥及红军瀑布",
    //   "location":14,
    //   "canvasLeft":2.6,
    //   "mapMarkX":0.5269,
    //   "mapMarkY":0.218,
    // },
    // {
    //   "name":"粉黛草观赏区",
    //   "location":15,
    //   "canvasLeft":3.87,
    //   "mapMarkX":0.26,
    //   "mapMarkY":0.36,
    // },
    // {
    //   "name":"飞花驿站",
    //   "location":16,
    //   "canvasLeft":4,
    //   "mapMarkX":0.2,
    //   "mapMarkY":0.414,
    // }

  ]
  scenicArea = {//景区mac对应的景区序号，"65535:1"对应coordinate中的1号
    "65535:1":1,
    "65535:2":1,
    "65535:3":2,
    "65535:4":2,
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
  latLng2Pixel(lng, lat) {//latitude 纬度   longitude经度
    var size = (2 << 19) * 256 / 4;
    var x = (1 + lng / 180) * size;
    var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
    y = (1 - y / 180) * size;
    return [x - 106791808, y - 57042816];
  }
  isInPolygon(checkPoint, polygonPoints) {//判断点是否在多边形内的算法
    var counter = 0;//checkpoint监测点   polygonPoints多边形点（数组）
    var i;
    var xinters;
    var p1, p2;
    var pointCount = polygonPoints.length;
    p1 = polygonPoints[0];
 
    for (i = 1; i <= pointCount; i++) {
        p2 = polygonPoints[i % pointCount];
        if (
            checkPoint[0] > Math.min(p1[0], p2[0]) &&
            checkPoint[0] <= Math.max(p1[0], p2[0])
        ) {
            if (checkPoint[1] <= Math.max(p1[1], p2[1])) {
                if (p1[0] != p2[0]) {
                    xinters =
                        (checkPoint[0] - p1[0]) *
                            (p2[1] - p1[1]) /
                            (p2[0] - p1[0]) +
                        p1[1];
                    if (p1[1] == p2[1] || checkPoint[1] <= xinters) {
                        counter++;
                    }
                }
            }
        }
        p1 = p2;
    }
      if (counter % 2 == 0) {
          return false;
      } else {
          return true;
      }
  }
  drawMapMark(num) {
    let [x,y] = this.coordinate[num].pos["coordinates"]
    let [m,n] = this.latLng2Pixel(x,y)
    m = m/29844
    n = n/11777
    let temp1 = 70/this.state.canvasHeight 
    let temp2 = 35/this.state.canvasWidth
    var currentCanvasLeft = -(m-temp2) * this.state.canvasWidth + 0.5*this.state.width;
    var mapMarkx = this.state.canvasWidth *  (m- temp2)
    var mapMarky = this.state.canvasHeight * (n - temp1)
    this.context.drawImage(mapMark, mapMarkx, mapMarky,70,70);
    this.context.draw();
    this.setState({
    ...this.state,
    canvasLeft:currentCanvasLeft,
    currentLocation:this.coordinate[num].id,
    })
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
             // console.log(bleObj.mac);
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
      if(beaconsTempArray.length && beaconsTempArray[0].rssi > that.state.criticalRssi && that.state.currentLocation != that.coordinate[beaconsTempArray[0].mac].id)
      {
        console.log(beaconsTempArray[0].mac)
        that.drawMapMark(beaconsTempArray[0].mac)
      }
      if(!beaconsTempArray.length || beaconsTempArray[0].rssi < that.state.criticalRssi) {//处理ibeacon信号弱或者收不到ibeacon信号时情况
        // Taro.getLocation().then( d => {
        //   console.log(11,d)
        //   for(let i = 1; i < that.coordinate.length;i++) {
        //     // if(that.isInPolygon([d["longitude"],d["latitude"]], that.coordinate[i].area["coordinates"])) {
        //     //   that.drawMapMark(i)
        //     //   break;
        //     // }
        //   }
        // })
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
  touchMoveCallBack(e) {//手指移动回调函数
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
    this.setState({
      ...this.state,
      touch:{
        ...this.state.touch,
        startLocationX:e.changedTouches[0]["x"],
        startLocationY:e.changedTouches[0]["y"]
      }
    })
  }
  seeDetails() {
    Taro.navigateTo({
      url: `../index/index?id=${this.state.currentLocation}`
    });
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
           <Image  src="cloud://test-70b991.7465-test-70b991/newmap.jpg" style= "height:{{canvasHeight}}px;width:{{canvasWidth}}px;"></Image>
        </Canvas> 
        <View className='introduction'>
          <View className='box1'></View>
          <View className="info">
            <View className='scenicName'>
              <View>
                {this.coordinate[this.state.currentLocation].name}
              </View>
            </View>
            <View className="details" onClick={this.seeDetails}>查看详情 >></View>
          </View>
        </View>
      </View>

    )
  }
}

