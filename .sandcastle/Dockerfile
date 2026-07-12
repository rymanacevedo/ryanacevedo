FROM node:22-bookworm-slim

ENV BUN_INSTALL=/usr/local
ENV PATH="${BUN_INSTALL}/bin:${PATH}"

RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential \
  ca-certificates \
  curl \
  git \
  jq \
  openssh-client \
  pkg-config \
  python3 \
  unzip \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
  | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && apt-get update && apt-get install -y --no-install-recommends gh \
  && rm -rf /var/lib/apt/lists/*

# Sandcastle's image builder supplies the dedicated runner's UID/GID. These
# defaults make direct Docker builds usable while keeping the values explicit.
ARG AGENT_UID=1001
ARG AGENT_GID=1002

RUN groupmod -o -g $AGENT_GID node \
  && usermod -o -u $AGENT_UID -g $AGENT_GID -d /home/agent -m -l agent node

RUN curl -fsSL https://bun.sh/install | bash
RUN bun install -g @openai/codex
RUN touch /home/agent/.gitconfig \
  && chown -R ${AGENT_UID}:${AGENT_GID} /home/agent \
  && chmod -R u+rwX,g+rwX /home/agent

USER ${AGENT_UID}:${AGENT_GID}
WORKDIR /home/agent

ENTRYPOINT ["sleep", "infinity"]
