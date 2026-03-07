FROM golang:1.22-alpine3.19 as builder

WORKDIR /app

COPY go.mod ./

RUN go mod download

COPY . .

RUN go build -o /app/check-links .

FROM alpine

COPY --from=builder /app/check-links /usr/local/bin/check-links

CMD [ "check-links" ]
