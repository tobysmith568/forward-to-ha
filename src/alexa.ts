import { HandlerInput, RequestHandler, SkillBuilders } from "ask-sdk-core";
import { IntentRequest, Response } from "ask-sdk-model";
import fetch from "node-fetch";
import { env } from "./env.js";

const { HA_URL, HA_TOKEN } = env;

const isTriggerIntent = (
  handlerInput: HandlerInput
): handlerInput is HandlerInput & {
  requestEnvelope: { request: IntentRequest & { intent: { name: "Trigger_HA" } } };
} => {
  const request = handlerInput.requestEnvelope.request;
  return request.type === "IntentRequest" && request.intent.name === "Trigger_HA";
};

const triggerIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return isTriggerIntent(handlerInput);
  },
  async handle(handlerInput: HandlerInput): Promise<Response> {
    if (!isTriggerIntent(handlerInput)) {
      throw new Error("Expected TriggerIntent");
    }

    const intent = handlerInput.requestEnvelope.request.intent;
    const trigger = intent.slots?.trigger?.value || "unknown";

    const deviceId = handlerInput.requestEnvelope.context.System.device?.deviceId || "unknown";

    console.log("Trigger:", trigger, "DeviceId:", deviceId);

    try {
      const res = await fetch(HA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(HA_TOKEN ? { Authorization: `Bearer ${HA_TOKEN}` } : {})
        },
        body: JSON.stringify({
          trigger,
          deviceId
        })
      });

      if (!res.ok) {
        throw new Error(`HA returned ${res.status}`);
      }
    } catch (err) {
      console.error("Error forwarding to HA:", err);
      return handlerInput.responseBuilder
        .speak("Sorry, I couldn't reach Home Assistant.")
        .getResponse();
    }

    return handlerInput.responseBuilder.speak("Okay").getResponse();
  }
};

const launchRequestHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput: HandlerInput): Response {
    return handlerInput.responseBuilder
      .speak("Welcome.")
      .reprompt("Try saying phrases like 'trigger TV Mode'.")
      .getResponse();
  }
};

export const skill = SkillBuilders.custom()
  .addRequestHandlers(launchRequestHandler, triggerIntentHandler)
  .create();
