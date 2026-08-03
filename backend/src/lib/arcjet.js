// Arcjrt configuration

import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";
import { ENV } from "./env.js"


// 1. Arcjet instance
const aj = arcjet({
  key: ENV.ARCJET_KEY,
  rules: [
    // 2. Protects app from common attacks e.g. SQL injection, XSS, ...
    shield({ mode: "LIVE" }),

    // 3. Bot detection rule --> detect whether the req. comes from google bot, bing bot, postman, python requests, ....
    detectBot({
      mode: "LIVE",     // blocks malicious requests immediately
      allow: [          // Block all bots except the following
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
      ],
    }),

    // 3. Create a token bucket rate limit. Other algorithms are supported.
    slidingWindow({
        mode: "LIVE",
        max: 100,           // max limit per interval
        interval: 60,       // 60 sec = 1 minute
    })
  ],
});


export default aj