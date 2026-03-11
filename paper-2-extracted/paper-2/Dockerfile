FROM --platform=amd64 oven/bun:1.3.7
ADD https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb /tmp/chrome.deb
RUN apt-get update && \
	apt-get install -y /tmp/chrome.deb && \
	rm -rf /var/lib/apt/lists/*
WORKDIR /opt
COPY bun.lock package.json ./
RUN bun ci
COPY index.ts ./
CMD ["bun", "run", "index.ts"]