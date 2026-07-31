#!/usr/bin/env pwsh
$GREEN = "`e[32m"
$NC = "`e[0m"
Write-Host "${GREEN}启动或更新...`n 1.server目录存放服务文件，site/web目录存放静态资源文件`n 2.不管是修改server文件或web文件都需要执行run.ps1${NC}"

# 获取本地 IP 地址
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne "127.0.0.1" } | Select-Object -First 1).IPAddress

if ([string]::IsNullOrEmpty($ip)) {
    Write-Host "未找到有效的 IP 地址。"
} else {
    Write-Host "当前服务器的 IP 地址是: $ip"
}

# 切换到 docker 目录
Push-Location ./docker

# 指定 .env 文件路径
$ENV_FILE = ".env"

# 如果 .env 文件存在，则处理其中的内容
if (Test-Path $ENV_FILE) {
    # 删除已有的 LOCAL_IP 行
    $content = Get-Content $ENV_FILE | Where-Object { $_ -notmatch "^LOCAL_IP=" }
    $content | Set-Content $ENV_FILE
}

# 追加 LOCAL_IP
Add-Content -Path $ENV_FILE -Value "LOCAL_IP=$ip"
$env:LOCAL_IP = $ip

# 重启 Docker 服务
Restart-Service -Name "com.docker.service" -Force -ErrorAction SilentlyContinue

# 停止并删除容器
docker-compose down

# 删除旧镜像
& docker rmi docker-iot-server:latest docker-web:latest docker-m7s:latest 2>$null

# 启动容器
docker-compose up -d

# 返回原目录
Pop-Location

Write-Host "${GREEN}启动或更新完毕...${NC}"
