import Taro, { Component, Config } from '@tarojs/taro'
import { View, Canvas, Image,Text} from '@tarojs/components'
import{AtButton} from 'taro-ui'
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
    navigationBarTitleText: '首页'
  }

  state= {
    touch: {
      distance: 0,
      scale: 1,
      baseWidth: 1500,
      baseHeight: 500,
      scaleWidth: 1500,
      scaleHeight:500
    }
  }
  componentWillMount () {}
    context = Taro.createCanvasContext('canvas', this.$scope)
  componentDidMount () {
    this.context.setFillStyle('rgba(255, 255, 255, 0)')
    this.context.fill()
    this.context.drawImage(mapMark,100,100)
    this.context.draw()
    // var devices:Taro.onBeaconUpdate.ParamParamPropBeaconsItem[] = [];
    // var info = {
    //   uuids:["fda50693-a4e2-4fb1-afcf-c6eb07647826"]
    // };
    // Taro.startBeaconDiscovery(info).then(()=>{
    //     console.log("开始扫描设备...");
    //     // 监听iBeacon信号
    //     Taro.onBeaconUpdate(function (res) {
    //       // 请注意，官方文档此处又有BUG，是res.beacons，不是beacons。
    //       if (res && res.beacons && res.beacons.length > 0) {
    //         console.log(res.beacons)
    //         console.log(devices);
    //         devices = res.beacons
    //         // 此处最好检测rssi是否等于0，等于0的话信号强度等信息不准确。我是5秒内重复扫描排重。
    //       }
    //     }); 
    // })

    // //超时停止扫描
    // setTimeout(function () {
    //   Taro.stopBeaconDiscovery({
    //     success: function () {
    //       console.log("停止设备扫描！");
    //       console.log(devices);
    //     }
    //   });
    // }, 5 * 1000);
   }
    touchstartCallback(e) {
      // 单手指缩放开始，也不做任何处理
      if(e.touches.length == 1) return
      console.log('双手指触发开始')
      // 注意touchstartCallback 真正代码的开始
      // 一开始我并没有这个回调函数，会出现缩小的时候有瞬间被放大过程的bug
      // 当两根手指放上去的时候，就将distance 初始化。
      let xMove = e.touches[1].clientX - e.touches[0].clientX;
      let yMove = e.touches[1].clientY - e.touches[0].clientY;
      let distance = Math.sqrt(xMove * xMove + yMove * yMove);
      this.setState({
        touch: {
          ...this.state.touch,
          distance: distance
        }
      })
      
  }
  touchmoveCallback(e) {
    
    // 单手指缩放我们不做任何操作
    if(e.touches.length == 1) return
    console.log('双手指运动')
    let xMove = e.touches[1].clientX - e.touches[0].clientX;
    let yMove = e.touches[1].clientY - e.touches[0].clientY;
    // 新的 ditance
    let distance = Math.sqrt(xMove * xMove + yMove * yMove);
    let distanceDiff = distance - this.state.touch.distance;
    let newScale = this.state.touch.scale + 0.005 * distanceDiff
    // 为了防止缩放得太大，所以scale需要限制，同理最小值也是
    if(newScale >= 2) {
        newScale = 2
    }
    if(newScale <= 0.6) {
        newScale = 0.6
    }
    let scaleWidth = newScale * this.state.touch.baseWidth
    let scaleHeight = newScale * this.state.touch.baseHeight
    console.log(111,scaleHeight,scaleWidth);
    // 赋值 新的 => 旧的
    this.setState({
      touch:
       {
        ...this.state.touch,
         distance: distance,
         scale: newScale,
         scaleWidth: scaleWidth,
         scaleHeight: scaleHeight,
         diff: distanceDiff
      }
    })
  }
    bindload(e) {
      console.log(111,e,12324)
      
      // bindload 这个api是<image>组件的api类似<img>的onload属性
      this.setState({
        touch:{
          ...this.state.touch,
          baseWidth: e.detail.width,
          baseHeight: e.detail.height,
          scaleWidth: e.detail.width,
          scaleHeight: e.detail.height
        }
      })
    }

  componentWillUnmount () {
    
   }
  innerAudioContext = Taro.createInnerAudioContext()
   playOn() {
   
    this.innerAudioContext.src = 'cloud://test-70b991.7465-test-70b991/voice/20180723 210558.m4a';
    this.innerAudioContext.autoplay = true
    this.innerAudioContext.onPlay(() => {
       console.log('录音播放中');
    })
     this.innerAudioContext.play();
   }
   playPause() {
      this.innerAudioContext.pause()
      console.log("pause")
//         this.innerAudioContext.onEnded(() => {
//             console.log('录音播放结束');
   }
    
  componentDidShow () { 
   
  }

  componentDidHide () { }

  render () {
    return (
    
        
        <View  
          className='canvas' 
          onTouchMove={this.touchmoveCallback} 
          onTouchStart={this.touchstartCallback}
          style='width=180px;height=130px;'
          >
          {/* <Canvas canvasId='canvs' style="background-image:url('https://7465-test-70b991-1258348028.tcb.qcloud.la/03chaojing.jpg?sign=94460181c6f3fbde63c644c329aae4ef&t=1546063831');width=180px;height=130px;background-size:180px 130px;"></Canvas> */}
           {/* <Text>Hello world!</Text>
          <AtButton onClick={this.playOn}>开始播放</AtButton>
          <AtButton onClick={this.playPause}>播放暂停</AtButton> */}
          <Image src='https://7465-test-70b991-1258348028.tcb.qcloud.la/03chaojing.jpg?sign=94460181c6f3fbde63c644c329aae4ef&t=1546063831' onTouchMove={this.touchmoveCallback} >
          {/* onTouchStart={this.touchstartCallback} style="width: {{ touch.scaleWidth }}px;height: {{ touch.scaleHeight }}px;z-index:-100;" onLoad={this.bindload}> */}
            {/* <Canvas style="background-image:url('https://7465-test-70b991-1258348028.tcb.qcloud.la/03chaojing.jpg?sign=94460181c6f3fbde63c644c329aae4ef&t=1546063831');background-size: {{ touch.scaleWidth }}px {{ touch.scaleHeight }}px;width:{{ touch.scaleWidth }}px;left:-1000px;height: {{ touch.scaleHeight }}px;z-index:100;" canvasId='canvas'></Canvas> */}
           </Image> 
        </View>
    
    )
  }
}

