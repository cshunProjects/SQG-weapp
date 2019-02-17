import Taro, { Component, Config } from '@tarojs/taro'
import { View, Swiper, SwiperItem,Text } from '@tarojs/components'
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
    navigationBarTitleText: '智慧神泉',
    
  }

  state= { 
    isShow:0,
    width:375,
    height:281.25,
    audio:0,
    
  }
  imageUrl: any[] = []
  const fly=new Fly;
  name:"";
    wordContent:"";
  innerAudioContext = Taro.createInnerAudioContext();
  componentWillMount () {
    var that = this;
    Taro.getSystemInfo({
      success: function(res) {
        let swiperHeight;
        console.log(res)
        swiperHeight = res.windowWidth/4*3;
        console.log(res)
        console.log(swiperHeight)
        that.setState({
          ...that.state,
          width:res.windowWidth,
          height:this.swiperHeight
        })
      }
    });
    let { id } = this.$router.params
    this.fly.get("http://39.98.84.18/api/attraction/1/").then( d =>{
      console.log(d["data"])
      // that.setState({
      //   ...that.state,
      //   name: d["data"].name,
      //   wordContent: d["data"].description
      // })
      that.name= d["data"].name,
      that.wordContent= d["data"].description
      if(d["data"].pic.length) {
        that.setState({
          ...that.state,
          isShow:1,
        })
        d["data"]["pic"].forEach(element => {
          that.imageUrl.push(element.pic)
        });
      }
      if(d["data"].audio) {
        that.setState({
          ...that.state,
          audio:1
        })
        console.log(1111)
        that.innerAudioContext.src = d["data"].audio;
      }
    })
  }
  componentDidMount () {
   
   }
  componentWillUnmount () {
    
   }
  
   playOn() {
   
   
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
    const listItems = this.imageUrl.map((url) => {
      return <SwiperItem key={url}>
        <Image src={url}  style="width:{{width}}px;height:150px"></Image>
      </SwiperItem> 
    })
    return (
        <View  className='page'>
           {this.state.isShow && 
             <Swiper 
             indicatorColor='#999'
             indicatorActiveColor='#333'
             circular
             indicatorDots
             autoplay
             className='swiper'
             >
            {listItems}
           </Swiper>
           }
           <View className="box1"></View>
           <View className="introductionContainer">
            <View className="introduction">
              <Text className="title">{this.name}</Text>
              {/* <View style="width:800px;height:1px;margin:0px auto;padding:0px;background-color:#D5D5D5;overflow:hidden;"></View> */}
              <View className="wordContentContainer">
               <Text className="wordContent">{this.wordContent}</Text>
              </View>
            </View>
          </View>
        </View>
    
    )
  }
}

