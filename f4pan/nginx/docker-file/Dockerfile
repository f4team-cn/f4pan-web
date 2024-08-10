FROM	nginx
RUN     	mkdir -p /etc/nginx/{html,logs}
COPY   	nginx.conf   /etc/nginx/nginx.conf
COPY   	f4pan.conf   /etc/nginx/conf.d/f4pan.conf
COPY   	aria2c.conf  /etc/nginx/conf.d/aria2c.conf
COPY	fastcgi.conf  /etc/nginx/fastcgi.conf

COPY    	access.log   /etc/nginx/logs/access.log
COPY	error.log    /etc/nginx/logs/error.log
COPY	f4pan_access.log   /etc/nginx/logs/f4pan_access.log
COPY	f4pan_error.log	   /etc/nginx/logs/f4pan_error.log
COPY	aria2c_access.log  /etc/nginx/logs/aria2c_access.log
COPY	aria2c_error.log   /etc/nginx/logs/aria2c_error.log 
RUN     	rm -rf /etc/nginx/conf.d/default.conf
