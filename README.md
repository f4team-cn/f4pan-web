## 基于f4pan项目打包的docker镜像。感谢大佬的源码。f4pan项目地址：https://github.com/f4team-cn/f4pan



### 同时将aria2下载器一块打包。



### 所需的5个镜像全是在docker仓库中拉取的，其中php8.2-fpm、nginx两个镜像二次构建，构建过程分别在php/docker-file/Dockerfile、nginx/docker-file/Dockerfile文件中

### 



### 此项目只在arm64的Ubuntu20.04(没错，就是小米5s。感谢b站的umeko大佬，让我的破手机还能继续发光发热。)测试过，其他设备需要自行测试。 x86架构的机器需要将镜像替换为x86的镜像。







## #需要提前安装好docker、docker-compose

```
#镜像太大了  传不上来  只能自己下载了

#下载镜像
docker pull mysql

docker pull redis

docker pull p3terx/aria2-pro

docker pull nginx

docker pull devilbox/php-fpm-8.2




#启动

docker-compose  up -d  
```



#### #Dockerfile需要重新打包php和nginx镜像，等的时间可能有点久。









```
#此处composer  install 需要手动执行。技术有限，写进docker-compose里面容器就会无线重启。
#启动后执行下面命令

docker exec -it php8.2  composer  install
```

![安装composer](https://github.com/user-attachments/assets/eafccb6e-a2b4-455d-ae43-0c6fbc05fc52)









```
#此处懒得再修改镜像了，直接手动执行
#安装完think后更改nginx映射路径的权限



chown -R www-data.www-data   /data/container/f4pan/nginx/nginx-data
```


![更改权限](https://github.com/user-attachments/assets/67ecee10-2de3-4c31-8061-7273e3632a99)





#### #安装城后后打开http://服务器地址:6602/#/install  根据引导安装。

#### #数据库host：mysql    port：3306   数据库的用户名：f4pan  数据库密码：123456   数据库库名：f4pan  


![数据库登录信息](https://github.com/user-attachments/assets/1fbe1ddd-97c0-42a8-ae0b-347cf01e2f84)

#### #redis host：redis  port：6379   密码不写

![redis信息](https://github.com/user-attachments/assets/6a408a80-f6b5-470b-9d08-124d5343cb71)


![cookie信息](https://github.com/user-attachments/assets/1b9e2037-fd45-4af1-b059-9d6b037f6154)



#### #aria2c-ng  web管理地址：http://服务器IP:6601   

#### #aria2c  rpc地址端口   http://服务器IP:16600    rpc密钥：12345678

![web连接rpc信息](https://github.com/user-attachments/assets/add934dc-572f-42e5-ae49-18c87841c167)









#### #解析时如果出现500报错，大概率是redis连接问题。修改如下文件

```
vim  /data/container/f4pan/nginx/nginx-data/html/f4pan/.env

#将：REDIS_HOST = 127.0.0.1     改为：REDIS_HOST = redis
```

![env信息](https://github.com/user-attachments/assets/79931211-1c89-4b7e-bc6b-3e5d63844aef)

#### #解析完成，通过rpc推送

![rpc推送设置](https://github.com/user-attachments/assets/c189c438-2353-4087-ab34-0228da1429ff)

