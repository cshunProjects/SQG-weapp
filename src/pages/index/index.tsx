import Taro, { Component, Config } from '@tarojs/taro'
import { Audio,View, Swiper, SwiperItem,Image } from '@tarojs/components'
import './index.scss'
import back from '../../static/back.png'
import audioImage from '../../static/speaker.png'
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
    isIPX:false,
    isShow:true,
    width:375,
    height:281.25,
    audio:0,
    playing:0,
    src:""
  }
  imageUrl: any[] = []
  name:"";
    wordContent:"";
  innerAudioContext = Taro.createInnerAudioContext();
  componentWillMount () {
    Taro.getSystemInfo().then(res => {
      if(res.model.search("iPhone X") != -1) {
          this.setState({
              isIPX:true
          })
      }
  })
    var that = this;  //这种代码不要出现了。。。尤其是在有胖尖头函数的情况下
    let { id } = this.$router.params
    Taro.request({url:`https://www.shenquangu.net:25888/api/attraction/${id}/`}).then( d =>{
      console.log(d["data"])
      that.setState({
        ...that.state,
        name: d["data"].name,
        wordContent: d["data"].description
      })
      that.name= d["data"].name,
      that.wordContent= d["data"].description
      if(d["data"].pic.length) {
        that.setState({
          ...that.state,
          isShow:true,
        })
        d["data"]["pic"].forEach(element => {
          that.imageUrl.push('https://www.shenquangu.net:25888'+element.pic)
        });
      }
      if(d["data"].audio) {
        that.setState({
          ...that.state,
          audio:1,
          src: d["data"].audio
        })
        // console.log(1111)
        that.innerAudioContext.src = 'https://www.shenquangu.net:25888'+ d["data"].audio;
      }
    })
  }
  componentDidMount () {}
  componentWillUnmount () {
    
   }
  
   play() {
   
    if(this.state.playing) {
      this.innerAudioContext.pause()
      this.setState({
        ...this.state,
        playing:0
      })
    } else {
      this.innerAudioContext.autoplay = true
      this.innerAudioContext.onPlay(() => {
         console.log('录音播放中');
      })
      this.innerAudioContext.play();
      this.setState({
        ...this.state,
        playing:1
      })}
   }
   playPause() {
      this.innerAudioContext.pause()
      console.log("pause")
//         this.innerAudioContext.onEnded(() => {
//             console.log('录音播放结束');
   }
    
   back() {
    this.innerAudioContext.stop();
     Taro.navigateBack();
     
   }
  componentDidShow () { 
   
  }

  componentDidHide () {
    this.innerAudioContext.onEnded();
   }

  render () {
    const listItems = this.imageUrl.map((url) => {
      return <SwiperItem key={url}>
        <Image src={url}  className='swiperItem'></Image>
      </SwiperItem> 
    })
    return (
        <View  className='page' >
          <View className = {this.state.isIPX ? 'topIPX' : 'top'}>
            <Image className={this.state.isIPX ? 'topBackIPX' : 'topBack'} onClick={this.back} src='https://image.flaticon.com/icons/svg/131/131922.svg'></Image>
            <View className = {this.state.isIPX ? 'topTitleIPX' : 'topTitle' } >景区详情</View>
            {this.state.isShow && 
             <Swiper 
             indicatorColor='#999'
             indicatorActiveColor='#333'
             circular
             indicatorDots
             autoplay
             className={this.state.isIPX ? 'swiperIPX' : 'swiper'}
             >
            {listItems}
           </Swiper>
           }
          </View>
          <View className={this.state.isIPX ? 'intrNameIPX' : 'intrName'}>{this.name}</View>
            {this.state.audio &&
          <Image className={this.state.isIPX ? 'intrAudioIPX' : 'intrAudio'} src={audioImage} onClick = {this.play}></Image>
        }
            <View  className={this.state.isIPX ? 'intrContentIPX' : 'intrContent'}>{this.wordContent}</View>
           {/* </View> */}
          {/* </View> */}
        </View>
    
    )
  }
}

