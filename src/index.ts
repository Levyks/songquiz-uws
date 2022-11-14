// noinspection JSIgnoredPromiseFromCall

import { config } from "@/config";
import { createServer } from "@/server";

createServer(config.port);
