FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -DskipTests dependency:go-offline
COPY src src
RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --uid 10001 fitcore && mkdir -p /app/data/exercise-media \
    && chown -R fitcore:fitcore /app
COPY --from=build --chown=fitcore:fitcore /workspace/target/*.jar app.jar
USER fitcore
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
