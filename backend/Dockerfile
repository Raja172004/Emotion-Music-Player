FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build application
RUN ./mvnw clean package -DskipTests

# Create uploads directory
RUN mkdir -p uploads/songs

# Expose port
EXPOSE 8080

# Run application
CMD ["java", "-jar", "target/emotion-music-backend-0.0.1-SNAPSHOT.jar"]