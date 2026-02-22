# Multi-stage Dockerfile for building and running the Spring Boot app
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

# copy sources and build with maven (skip tests for speed)
COPY . /app
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# allow platform to set JVM args and PORT
ENV JAVA_OPTS=""
EXPOSE 8080

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
