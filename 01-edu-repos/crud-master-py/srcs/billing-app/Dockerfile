FROM python:3.12-alpine

WORKDIR /usr/src/

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENTRYPOINT ["python", "server.py"]
