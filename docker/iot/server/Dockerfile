FROM openjdk:17-jdk-alpine
ENV LANG=C.UTF-8

WORKDIR /app
COPY ./config/ /app/config
COPY ./lib/ /app/lib

COPY ./ffmpeg-7.0.2-amd64-static/ /app/ffmpeg-7.0.2-amd64-static
# 设置 ffmpeg 相关文件的执行权限
RUN chmod +x /app/ffmpeg-7.0.2-amd64-static/ffmpeg \
    && chmod +x /app/ffmpeg-7.0.2-amd64-static/ffprobe \
    && chmod +x /app/ffmpeg-7.0.2-amd64-static/qt-faststart
ENV FFMPEG_PATH=/app/ffmpeg-7.0.2-amd64-static/ffmpeg

COPY ./iot-server-1.0.jar  /app

ENV TimeZone=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TimeZone /etc/localtime && echo $TimeZone > /etc/timezone
ENTRYPOINT ["sh","-c","java  -Duser.timezone=GMT+8 -Dloader.path=./lib  -jar ./iot-server-1.0.jar "]
