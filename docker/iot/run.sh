#!/bin/bash
#!/bin/bash
GREEN='\033[0;32m'
NC='\033[0m'
echo  -e  "${GREEN}启动或更新...\n 1.server目录存放服务文件，site/web目录存放静态资源文件\n 2.不管是修改server文件或web文件都需要执行run.sh${NC}"

ip=$(ip -o -4 addr show | grep -v '127.0.0.1' | awk '{print $4}' | cut -d/ -f1 | head -n 1)
if [ -z "$ip" ]; then
    echo "未找到有效的 IP 地址。"
else
    echo "当前服务器的 IP 地址是: $ip"
fi 


cd  ./docker
# 指定.env文件路径
ENV_FILE=".env"

# 如果.env文件存在，则处理其中的内容
if [ -f "$ENV_FILE" ]; then
    # 删除已有的 LOCAL_IP 行
    sed -i '/^LOCAL_IP=.*/d' "$ENV_FILE"
fi
echo "LOCAL_IP=$ip" >> .env
export LOCAL_IP=$ip
systemctl restart docker
docker-compose  down
docker rmi  docker-iot-server:latest  docker-web:latest docker-m7s:latest
docker-compose up    -d 

echo -e  "${GREEN}启动或更新完毕...${NC}"
