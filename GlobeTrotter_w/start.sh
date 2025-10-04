set -e

cleanup() {
    docker-compose down
    kill 0
}

trap cleanup EXIT

docker-compose up -d
(cd server && pnpm i && pnpm db:setup && pnpm start:dev) &
(cd client && pnpm i && pnpm dev) 
wait
