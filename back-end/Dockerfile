FROM docker:20.10-dind

# Installing system deps:
RUN apk update && apk upgrade&& apk add --no-cache python3 python3-dev py3-pip
# Create and set the working directory
WORKDIR /app

# Copy the Python app source back-end
COPY back-end /app/back-end
RUN pip install -r /app/back-end/requirements.txt

ENTRYPOINT ["dockerd-entrypoint.sh"]

# Command to run the Python app
CMD ["python", "/app/back-end/app.py"]

# Expose the port for the npm app
EXPOSE 8080