import Taro from "@tarojs/taro";
let defaultHeaders = {};
let URLPrefix = "https://www.shenquangu.net:25888/";

export async function get(URL: string) {
  return await Taro.request({
    method: "GET",
    url: URLPrefix + URL,
    header: defaultHeaders
  });
}