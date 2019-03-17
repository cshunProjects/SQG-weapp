import Taro, { Component} from '@tarojs/taro'
import { Picker, View, } from '@tarojs/components'
import './index.scss'

export default class HomePageTar extends Component{
  state = {
    isIPX:false
  }
    componentWillMount() {
        Taro.getSystemInfo().then(res => {
            if(res.model.search("iPhone X") != -1) {
                this.setState({
                    isIPX:true
                })
            }
        })
     
    }
    

  render () {
    return (
      <View className={this.state.isIPX ? 'indexIpx' : 'index'}>
        <View className={this.state.isIPX ? 'topIpx' : 'top'}>智慧神泉</View>
      </View>
    )
  }
}

