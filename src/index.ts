// noinspection JSIgnoredPromiseFromCall

import { createServer } from "@/server";

const port = Number(process.env.PORT) || 3000;
createServer(port);
