FROM dockerhub/sunbird-rc-core:v0.0.4

ADD *.json /home/sunbirdrc/config/public/_schemas/

CMD ["java", "-Xms1024m", "-Xmx2048m", "-XX:+UseG1GC", "-Dserver.port=8081", "-cp", "/home/sunbirdrc/config:/home/sunbirdrc", "org.springframework.boot.loader.JarLauncher"]