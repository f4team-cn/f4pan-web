FROM  		devilbox/php-fpm-8.2:latest
ENV   		TZ=Asia/Shanghai
RUN   		ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN   		apt-get update && apt-get install -y  curl wget zip unzip git libfreetype6-dev libjpeg62-turbo-dev libpng-dev 

#加载php扩展
RUN   		docker-php-source extract

#安装pdo_mysql
RUN   		docker-php-ext-install pdo_mysql

#安装php-redis
COPY  		phpredis-6.0.2  /usr/src/php/ext/redis
RUN   		docker-php-ext-install redis

#安装composer
RUN   		mkdir -p  /etc/nginx/html/f4pan
ENV   		COMPOSER_HOME /root/composer
RUN   		curl -sS  https://getcomposer.org/installer | php --  --install-dir=/usr/local/bin --filename=composer
ENV   		PATH $COMPOSER_HOME/vendor/bin:$PATH
WORKDIR   	/etc/nginx/html/f4pan
