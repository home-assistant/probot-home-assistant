FROM node:13-buster

# Set shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install git, process tools
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -\
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        procps git \
        yarn \
        build-essential \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*


# Install test utils
WORKDIR /workspaces

# Setup AWS
COPY .devcontainer/* /tmp/data/
RUN mkdir -p /root/.aws \
    && echo -e "[default]\nregion = us-east-1" > /root/.aws/config \
    && [ -f /tmp/data/credentials ] && cp /tmp/data/credentials /root/.aws/ || true \
    && rm -rf /tmp/data

# Set the default shell to bash rather than sh
ENV SHELL /bin/bash
ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8
