<p align="center">
  <a href="https://www.f4team.cn/"><img src="https://www.f4team.cn/logo/logo-hdpi.png" width="500" height="200" alt="F4Team"></a>
</p>



***************************************

<h2 align="center">

`F4Pan`，是一个获取下载链接的工具

</h2>


## ⚠ 免责声明
* `F4Pan`(下称本项目)使用的接口全部来自于官方，无任何破坏接口的行为<br>
* 本项目所有代码全部开源，仅供学习参考使用，请遵守相关的法律法规，禁止商用，若无视声明使用此项目所造成的一切后果均与作者无关<br>
* 本项目需要登录账号，具有一定风险，包括但不限于限速，封号，限制相关功能等<br>
* 本项目，包括其开发者、贡献者和附属个人或实体，特此明确否认与任何形式的非法行为有任何关联、支持或认可。本免责声明适用于可能违反地方、国家或国际法律、法规或道德准则的F4Pan项目的任何使用或应用。<br>
* 本项目是一个开源软件项目，旨在促进其预期用例中的合法和道德应用程序。每个用户都有责任确保其使用F4Pan符合其管辖范围内的所有适用法律和法规。<br>
* 对于用户违反法律或从事任何形式的非法活动的任何行为，本项目的开发者和贡献者不承担任何责任。用户对自己的行为和使用F4Pan可能产生的任何后果负全部责任。<br>
* 此外，本项目(包括其开发人员、贡献者和用户)提供的任何讨论、建议或指导都不应被解释为法律建议。强烈建议用户寻求独立的法律顾问，以了解其行为的法律影响，并确保遵守有关的法律和条例。<br>
* 通过使用或访问本项目，用户承认并同意免除开发人员、贡献者和附属个人或实体因使用或滥用该项目而产生的任何和所有责任，包括因其行为而产生的任何法律后果。<br>
* 请负责任地、依法使用本项目。


## 🚧 所需环境
* PHP >= 8.0
* Mysql
* Redis
* Curl
  <br>⚠ 安装Mysql与Redis后若还未通过环境检查请在对应版本的`php.ini`中启用对应的拓展


## 🔧 安装

本项目使用了`thinkphp8.0`框架<br>
Nginx伪静态（单独部署后端）:
```
location ~* (runtime|application)/{
	return 403;
}
location / {
	if (!-e $request_filename){
		rewrite  ^(.*)$  /index.php?s=$1  last;   break;
	}
}
```
Nginx伪静态（前端+后端）:
```
location ~* (runtime|application)/{
    return 403;
}
location /api {
    rewrite  ^(.*)$  /index.php?s=$1  last;   break;
}
location / {
    index index.html;
    try_files $uri $uri/ /index.html;
}
```
### 🔧 手动构建
本项目`前后端分离`的架构<br>
可从`Releases`页面下载完整包<br>

1. 解压到网站目录下
2. 设置运行目录为`/public`
3. 设置伪静态
4. 访问`http(s)://你的域名/#/install`跟随引导进行安装

## ⚠️ Tips
动态密钥获取方法:
前端暂时没有添加apikey的管理功能，如需使用请手动获取

1. 带`Authorization`头部GET访问`/api/admin/api_keys/generate`获取apikey(此key用来生成动态解析密钥)
2. GET访问`/api/public/get_parse_key?apikey=第一步获取的apikey`获取动态解析密钥

后续版本中功能会陆续完善

## ✔️ 反馈
### 欢迎提交BUG
可通过`Issues`或 [Telegram](https://t.me/f4pan_project) 与我们取得联系

## 🔗 相关仓库
前端 [f4pan-web](https://github.com/f4team-cn/f4pan-web)

后端 [f4pan](￶https://github.com/f4team-cn/f4pan)

# ©️ 最终解释权归F4Team所有
进入我们的[官网](https://www.f4team.cn/)