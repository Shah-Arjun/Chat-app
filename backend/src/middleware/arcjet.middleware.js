import express from 'express'
import aj from "../lib/arcjet.js"
import { isSpoofedBot } from "@arcjet/inspect"


export const arcjetPotection = async (req, res, next) => {
    try {
        const decision = await aj.protect(req)

        if (decision.isDenied()) {    //OR decision.action!=='allow'  OR  as per need...
          if (decision.reason.isRateLimit()) {
            return res.status(429).json({ message: "Too many request. Please try again later." });
          } else if (decision.reason.isBot()) {
            return res.status(403).json({ message: "Bot access denied." });
          } else {
            return res.status(403).json({ message: "Access denied by security policy." });
          }
        }


        // check for spoofed bots  --. bots that pretends to be human 
        if(decision.results.some(isSpoofedBot)) {
            return res.status(403).json({
                error: "Spoofed bot detected.",
                message: "Malicious bot activity detected."
            })
        }

        next()
    } catch (error) {
        console.log("Arcjet protection error", error)
        next()
    }
}