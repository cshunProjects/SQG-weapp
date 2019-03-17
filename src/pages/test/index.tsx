import Taro, { Component, Config, request } from '@tarojs/taro'
import { View, Canvas, CoverImage ,CoverView, Swiper,SwiperItem} from '@tarojs/components'
import mapMark from '../../static/my_loc.png'
import map from '../../static/newmap.jpg'
import './index.scss'
import isInPolygon from '../services/api/isInPolygon'
import HomePageTar from '../../components/HomePageTar/index'
import shadowUp from '../../static/shadowUP.png'
import shadowDown from '../../static/shadowDOWN.png'
import cancel from '../../static/cancel.png'
import down1 from '../../static/up.png'
import down from '../../static/down.png'
import shenquangu from '../../static/shenquangu.jpeg'
const FPS = 60;

type num = [number];
interface Position {
  type: string;
  cooridates: num;
}

interface Coordinate {
  pos: Position;
  id: number;
  name: string;
  description: string;
  audio: string;
  area: {
    cooridates: [num];
    type: string;
  };
}

function throttle(fn, gapTime = 1500): (e: any) => void {
  let lastTime;
  return function (e) {
    if (!lastTime) {
      lastTime = Date.now();
      fn(e);
    }
    else {
      if (Date.now() - lastTime >= gapTime) {
        fn(e)
        lastTime = Date.now();
      };

    }
  };
}

export default class Index extends Component {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
  }
  context = Taro.createCanvasContext('canvas', this.$scope);
  coordinate: Coordinate[] = [];
  timer: any = null
  beginTouchX: number = 0
  beginTouchY: number = 0
  mapWidth: number = 0
  mapHeight: number = 0
  mapX: number = 0
  mapY: number = 0
  distance:number = 0
  scale:number = 1
  baseWidth:number = 0
  baseHeight:number = 0
  update:number = 0
  uuidArray = {
    uuids: ["02ff8bf0-0913-47d6-b513-c382cf326fc7"],
  }
  state = {
    
    tip:true,
    up:true,
    isIPX:false,
    currentLocation: -1,
    mapViewHeight: 0,
    mapViewWidth: 0,
    marginTop: 0,
    marginLeft: 0,
    width: 337,//手机屏幕宽度
    canvasLeft: 0,//画布向左移动距离
    canvasHeight: 640,//画布高度
    canvasWidth: 1801,//画布长度  主景区
    touch: {
      startLocationX: 0,
      startLocationY: 0,
    }
  }

  constructor(props) {
    super(props);
    this.move = throttle(this.move, 1000 / FPS);
  }
  
  request() {
    Taro.request({url:"https://www.shenquangu.net:25888/api/attraction/"}).then(d => {
      console.log(d)
      this.load = 1;
      this.coordinate.push.apply(this.coordinate, d["data"])
    },res => {
      console.log(res)
      this.request();
    });
  }
  componentWillMount() {
    
    Taro.getSystemInfo().then(res => {
      var isIpx = false;
      if(res.model.search("iPhone X") != -1) {
        isIpx = true;
    }
      let height = res.windowHeight * 0.85
      let width = height * 2.5337837838
      this.mapHeight = height
      this.mapWidth = width
      this.baseWidth = width
      this.baseHeight = height
      this.setState({
        ...this.state,
        isIPX:isIpx,
        width: res.windowWidth,
        canvasHeight: height,
        canvasWidth: width,
      })
    })
    this.request();
  }
  componentDidMount() { }
  componentWillUnmount() {

  }
  latLng2Pixel(lng, lat) {//latitude 纬度   longitude经度
    var size = (2 << 19) * 256 / 4;
    var x = (1 + lng / 180) * size;
    var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
    y = (1 - y / 180) * size;
    return [x - 106791808, y - 57042816];
  }
  
  drawMapMark(num) {
    var i = 1;
    var that = this
    for (i = 0; i < this.coordinate.length; i++) {
      if (num == this.coordinate[i].id) {
        console.log(i)
        console.log(this.state.currentLocation)
        if(this.state.currentLocation != i)
        {
          this.setState({
            currentLocation:i
          })
      }
        break;
      }
    }
    let [x, y] = this.coordinate[i].pos["coordinates"]
    let [m, n] = this.latLng2Pixel(x, y)
    m = m / 29844  
    n = n / 11777
    let temp1 = 25 / this.mapHeight
    let temp2 = 25 / this.mapWidth
    setTimeout(function () {
      var mapMarkx = 0;
      var mapMarky = 0;
      if(that.update) {
        that.update = 0;
        that.mapWidth = that.baseWidth * 2;
        that.mapHeight = that.baseHeight * 2;
        that.mapY = -(n - temp1) * that.mapHeight + 0.5 * (that.state.canvasHeight - 375);
        that.mapX = -(m - temp2) * that.mapWidth + 0.5 * that.state.width;
        mapMarkx = that.mapX + (m - temp2) * that.mapWidth
        mapMarky = that.mapY + that.mapHeight *  (n - temp1)
        that.context.drawImage(map,that.mapX,that.mapY,that.mapWidth,that.mapHeight)
      }
      else {
        mapMarkx = that.mapX + (m - temp2) * that.mapWidth
        mapMarky = that.mapY + that.mapHeight *  (n - temp1)
        that.context.drawImage(map,that.mapX,that.mapY,that.mapWidth,that.mapHeight)
      }
      
      that.context.drawImage(mapMark, mapMarkx, mapMarky, 50, 50);
      that.context.draw();
    }, 50)
    
  }
  // map=""
  animation:any =null ;
  load:any = 0;
  componentDidShow() {
    this.animation = Taro.createAnimation({
             transformOrigin: "50% 50%",
             duration: 1000,
             timingFunction: "ease",
             delay: 0
           })
    let imageInfo = {
      url:'https://7465-test-70b991-1258348028.tcb.qcloud.la/newmap.jpg?sign=84bb93649d5627dcd3b25b66fb6e599a&t=1551333447'
    }
    
    // Taro.downloadFile(imageInfo).then(res => {
    //   this.map = res.tempFilePath
    //   console.log(this.map,res)
    // })
    
    var that = this
    setTimeout(function () {
      that.context.drawImage(map, this.mapX, this.mapY, this.mapWidth, this.mapHeight)
      that.context.draw()
    }, 500)
    
    var starts=new Date().getTime();
    while(true) if(new Date().getTime()-starts>2000) break;
    console.log(true);
    // beacon搜索函数
    var beacon = {
      m: 2.5,//m秒采集一次数据，更新周期
      n: 5,//滑动窗口大小
      p: 0,//数组指针
      timer: -1,
      max: { id: "", rssi: -128 },
      k: 3,//5-10
      array: [[]],
    };
    var beaconsArray: any[] = [];
    beaconsArray = new Array(beacon.n);
    for (var i = 0; i < beaconsArray.length; ++i)
      beaconsArray[i] = new Array();

    var that = this;
    var devices: any[] = [];

    Taro.startBeaconDiscovery(this.uuidArray).then(() => {
      Taro.onBeaconUpdate(function (res) {
        if (res && res.beacons && res.beacons.length > 0) {
          devices = res.beacons;
          for (var i = 0; i < devices.length; ++i) {
            if (devices[i].major == 65535 && devices[i].accuracy != -1) {
              var t = String(devices[i].minor) + " ";
              if (!(t in beaconsArray[beacon.p]))
                beaconsArray[beacon.p][t] = { num: 0, sum: 0 }
              beaconsArray[beacon.p][t].num++;
              beaconsArray[beacon.p][t].sum += devices[i].rssi;

            }
          }
        }
      });
    });
    this.timer = setInterval(function () {
      var all: any[] = [];
      for (var i = 0; i < beacon.n; ++i) {//合并
        for (var x in beaconsArray[i]) {
          if (!(x in all))
            all[x] = { num: 0, sum: 0 }
          all[x].num += beaconsArray[i][x].num;
          all[x].sum += beaconsArray[i][x].sum;
        }
      }
      var max = { id: "", rssi: -128 };
      beacon.max.rssi = -128;
      for (var x in all) {
        all[x].sum /= all[x].num;
        if (all[x].sum > max.rssi) {//找当前最大
          max.rssi = all[x].sum;
          max.id = x;
        }
        if (Number(x) >> 8 == Number(beacon.max.id) >> 8)//找之前最大的rssi
          beacon.max.rssi = beacon.max.rssi > all[x].sum ? beacon.max.rssi : all[x].sum;
      }
      var allstr: any[] = [];

      for (var x in all)
        allstr.push(((Number(x) >> 8) + 1) + "-" + ((Number(x) & 0xFF) + 1) + ":" + all[x].num + " " + all[x].sum.toFixed(2));
      var isupdate = false;
      if (max.id) {
        if (!beacon.max.id)
          isupdate = true;
        else if (beacon.max.id in all) {
          if (max.rssi - beacon.max.rssi > beacon.k)
            isupdate = true;
        }
        else isupdate = true;
      }
      if (isupdate) {
        beacon.max.id = max.id;
        that.scale = 2
        that.update = 1
        that.drawMapMark((Number(max.id) >> 8) + 1);
      }
      if (!Object.keys(all).length) {
        Taro.getLocation().then(d => {
          let i;
          for (i = 0; i < that.coordinate.length; i++) {
            if (isInPolygon([d["longitude"], d["latitude"]], that.coordinate[i].area["coordinates"][0])) {
              if (i == that.state.currentLocation) break;
              that.scale = 2
              that.update = 1
              that.drawMapMark(that.coordinate[i].id);
              break;
            }
          }
          if (i == that.coordinate.length) {
            that.setState({
              currentLocation: -1
            })
          }
        })
      }
      beacon.p = (beacon.p + 1) % beacon.n;
      beaconsArray[beacon.p] = [];

    }, beacon.m * 1000);
    
  }


  
  componentDidHide() {
    Taro.stopBeaconDiscovery(this.uuidArray)
    clearInterval(this.timer)
   }
  move = (e) => {//手指移动回调函数
    console.log(this.state.currentLocation)
  if (e.changedTouches.length == 1) {
    let currentx = e.changedTouches[0]["x"]
    let currenty = e.changedTouches[0]["y"]
    let deltax = currentx - this.beginTouchX
    let deltay = currenty - this.beginTouchY
    this.mapX = this.mapX + deltax
    this.mapY = this.mapY + deltay * 0.1
    if (this.mapX > 0) this.mapX = 0
    if (this.mapX < -this.mapWidth + this.state.width) this.mapX = -this.mapWidth + this.state.width
    if (this.mapY > 0) this.mapY = 0
    if (this.mapY < -this.mapHeight ) this.mapY = -this.mapHeight + this.baseHeight
    this.beginTouchX = currentx
  } 
  else {
    console.log(123);
    let xMove = e.changedTouches[1]["x"] - e.changedTouches[0]["x"]
    let yMove = e.changedTouches[1]["y"] - e.changedTouches[0]["y"];
    // 新的 ditance
    let distance = Math.sqrt(xMove * xMove + yMove * yMove);
    let distanceDiff = distance - this.distance;
    
    let newScale = this.scale + 0.006 * distanceDiff
    if(newScale >= 3) {
        newScale = 3
    }
    if(newScale <= 1) {
        newScale = 1
    }
    let xMiddle = (e.changedTouches[1]["x"] + e.changedTouches[0]["x"]) / 2
    let yMiddle = (e.changedTouches[1]["y"] + e.changedTouches[0]["y"]) / 2
    let xPercent = (-this.mapX + xMiddle) / this.mapWidth
    let yPercent = (-this.mapY + yMiddle) / this.mapHeight
    this.mapWidth = newScale * this.baseWidth
    this.mapHeight = newScale * this.baseHeight
    this.mapX = - xPercent * this.mapWidth  + xMiddle
    this.mapY = - yPercent * this.mapHeight + yMiddle
    this.distance = distance
    this.scale = newScale
  }
  if(this.state.currentLocation != -1) {
    this.drawMapMark(this.coordinate[this.state.currentLocation].id)
  }
  this.context.drawImage(map, this.mapX, this.mapY, this.mapWidth, this.mapHeight)
  
  if(this.state.currentLocation == -1) {
    this.context.draw()
  }
  
}
start = (e) => {//开始触摸时执行的函数，将触摸起始位置保存
  if(e.touches.length == 1) {
    this.beginTouchX = e.changedTouches[0]["x"]
    this.beginTouchY = e.changedTouches[0]["y"]
  } else {
      let xMove = e.touches[1]["x"] - e.touches[0]["x"];
      let yMove = e.touches[1]["y"] - e.touches[0]["y"];
      this.distance = Math.sqrt(xMove * xMove + yMove * yMove);
  }
}
seeDetails() {
  Taro.stopBeaconDiscovery(this.uuidArray)
  clearInterval(this.timer)
  Taro.navigateTo({
    url: `../index/index?id=${this.coordinate[this.state.currentLocation].id}`
  });
}
close() {
  this.setState({
    tip:false,
  })
}
translateUp() {
  var temp = - this.state.canvasHeight * 0.55;
  console.log(temp)
  console.log(this.state.canvasHeight)
  this.animation.translate(0, temp).step()
  this.animation= this.animation.export();
  setTimeout(() => {
    this.animation = Taro.createAnimation({
      transformOrigin: "50% 50%",
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    })
  }, 500);
  this.setState ({
    up:false
  })
}
translateDown() {
  var temp =this.state.canvasHeight * 0.55;
  this.animation.translate(0, temp).step()
  this.animation= this.animation.export();
  setTimeout(() => {
    this.animation = Taro.createAnimation({
      transformOrigin: "50% 50%",
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    })
  }, 500);
  this.setState ({
    up:true
  })
}
render() {
  return (
    <View className='page' >
      <HomePageTar></HomePageTar>
      <Canvas
        className={this.state.isIPX ? 'canvasIPX' : 'canvas' }
        canvasId='canvas'
        onTouchStart={this.start}
        onTouchMove={this.move}
      >
      </Canvas>
      <CoverImage src={shadowUp} className={this.state.isIPX ? 'shadowUpIPX' : 'shadowUp'}/>
      <CoverImage src={shadowDown} className='shadowDown'/>
      
      {this.state.currentLocation != -1 
      ?<CoverView className = 'detail' animation={this.animation}>
          <CoverImage className='detailImage' src={'https://www.shenquangu.net:25888' + this.coordinate[this.state.currentLocation]["pic"][0].pic}></CoverImage>
          <CoverView className='detailTitle'>{this.coordinate[this.state.currentLocation].name}</CoverView>
          <CoverView className='detailIntroduction'>{this.coordinate[this.state.currentLocation].description}</CoverView>
          <CoverView onClick={this.seeDetails} className='seeDetail'>查看详情>></CoverView>
        </CoverView>
      :<CoverView className = 'detail' animation={this.animation}>
        <CoverImage className='detailImageFalse' src={shenquangu}></CoverImage>
        <CoverView onClick={this.seeDetails} className='seeDetailFalse'>您当前不在景点范围内</CoverView>
        </CoverView>
      }
     
      {
        this.state.up &&
            <CoverImage src={down1} onClick={this.translateUp} className='up'></CoverImage>
          
      }
      {this.state.up == false &&
      <CoverImage onClick={this.translateDown} src={down} className='down'></CoverImage>
      
      }
      
      {this.state.tip && 
        <CoverView className={this.state.isIPX ? 'tipIPX' : 'tip'}>
          <CoverView className = 'tipContent'>提示：请打开蓝牙和GPS</CoverView>
        </CoverView>
      }
      {this.state.tip && 
        <CoverImage onClick={this.close} className={this.state.isIPX ? 'tipImageIPX' : 'tipImageIPX'} src={cancel}></CoverImage>
      }

     

      

      {/* {(this.state.currentLocation != -1) &&
        <View className='introduction'>
          <View className='box1'></View>
          <View className="info">
            <View className='scenicName'>
              <View>
                
              </View>
            </View>
            <View className="details" >查看详情 >></View>
          </View>
        </View>
      } */}
    </View>
  )
}
}

