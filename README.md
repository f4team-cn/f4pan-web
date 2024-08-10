f4pan项目打包的docker镜像，同是将aria2下载器一块打包。


所需的5个镜像全是在docker仓库中拉取的，其中php8.2-fpm、nginx两个镜像二次构建，构建过程扽别在php/docker-file/Dockerfile、nginx/docker-file/Dockerfile文件中


此项目只在arm64的Ubuntu20.04上面测试过，其他设备需要自行测试。x86架构的机器需要将镜像替换为x86的镜像。




需要提前安装好docker、docker-compose


#启动
docker-compose  up -d  


#此处composer  install 需要手动执行。技术有限，写进docker-compose里面容器就会无线重启。
#启动后执行下面命令
docker exec -it php8.2  composer  install


#此处懒得再修改镜像了，直接手动执行
#安装完think后更改nginx映射路径的权限
chown -R www-data.www-data   /data/container/f4pan/nginx/nginx-data


#安装城后后打开http://服务器地址:6602/#/install  根据引导安装。
#数据库host：mysql    port：3306   数据库的用户名：f4pan  数据库密码：123456   数据库库名：f4pan  
#redis host：redis  port：6379   密码不写


#aria2c  rpc地址端口   http://服务器IP:16600    rpc密钥：12345678
#aria2c-ng  web管理地址：http://服务器IP:6601   


#解析时如果出现500报错，大概率是redis连接问题。修改如下文件
vim  /data/container/f4pan/nginx/nginx-data/html/f4pan/.env

#将：REDIS_HOST = 127.0.0.1     改为：REDIS_HOST = redis
