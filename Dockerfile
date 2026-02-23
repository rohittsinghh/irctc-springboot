# Multi-stage Dockerfile for building and running the Spring Boot app
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

# install Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# copy sources and build with maven (skip tests for speed)
COPY . /app
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# copy seed data so trains/users are available on first boot
COPY --from=build /app/data ./data

# default JVM flags tuned for fast startup on resource-constrained hosts
# -XX:TieredStopAtLevel=1 skips C2 JIT at startup (big win on low-CPU VMs)
# -XX:+UseSerialGC avoids parallel GC threads spinning up on 1-CPU instances
ENV JAVA_OPTS="-XX:TieredStopAtLevel=1 -XX:+UseSerialGC -Xms128m -Xmx256m"
EXPOSE 8080

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
