# Lightweight always-on Runner for Playwright bots
# Uses official Playwright image with browsers preinstalled
FROM mcr.microsoft.com/playwright:v1.47.2-jammy

WORKDIR /app

# Install dependencies for bots
COPY package.json package.json
COPY tsconfig.json tsconfig.json
RUN npm install --omit=dev=false

# Copy source
COPY src ./src
COPY supabase-runner.ts ./supabase-runner.ts

# Ensure browsers are available (usually preinstalled in this image)
RUN npx playwright install --with-deps || true

# Environment variables (inject at deploy time)
# ENV SUPABASE_URL="" \
#     SUPABASE_SERVICE_ROLE="" \
#     VITE_SUPABASE_ANON="" \
#     SUPABASE_ADMIN_EMAIL="" \
#     SUPABASE_ADMIN_PASSWORD=""

# Start long-running loop
CMD ["npx", "tsx", "supabase-runner.ts"]