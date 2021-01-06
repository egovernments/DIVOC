FROM dockerhub/open-saber

ADD *.json /home/opensaber/config/public/_schemas/

CMD ["java", "-Xms1024m", "-Xmx2048m", "-XX:+UseG1GC", "-Dserver.port=8081", "-cp", "/home/opensaber/config:/home/opensaber", "org.springframework.boot.loader.JarLauncher"]