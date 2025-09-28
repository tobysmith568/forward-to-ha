## forward-to-ha

Turn Alexa voice commands into Home Assistant webhook calls in three steps so that Home Assistant can control how to action Alexa commands like "Alexa, trigger TV mode".

- Create a Home Assistant automation that responds to webhooks
- Deploy this docker container - either in a cloud or locally with your HA
- Create an Alexa Skill that points to your deployment of this container

More details on how to set these steps up is detailed below.

---

## 1) Home Assistant: Create a webhook automation

In Home Assistant, create an automation with a Webhook trigger. Use a long, random webhook_id.

Example (YAML):

```yaml
alias: Alexa Command Handler
trigger:
  - platform: webhook
    webhook_id: f7c8605f-02d8-4f4b-bb84-2c1c0e4d8c6a
action:
  - service: logbook.log
    data:
      name: Forward-to-HA
      message: "trigger={{ trigger.json.trigger }}, deviceId={{ trigger.json.deviceId }}"
```

This app will POST JSON like this:

```json
{ "trigger": "TV mode", "deviceId": "alexa-device-id" }
```

Set `HA_URL` to your webhook URL:

- Nabu Casa Cloudhook: the provided cloudhook URL
- Public HA: `https://your.domain/api/webhook/<webhook_id>`

Note: `/api/webhook` does not require a token. If you set HA_TOKEN, it’s ignored by webhook endpoints.

---

## 2) Deploy this Docker image

Deploy this docker container anywhere that can run a container (Cloud Run, ECS, Kubernetes, Fly.io, your VPS). Or run it locally with Docker. The only requirement is that it can make outbound HTTPS requests to your Home Assistant instance, and that it can be reached publicly over HTTPS by Alexa.

Environment variables:

- `HA_URL` (required): your HA webhook URL
- `HA_TOKEN` (optional): not used for /api/webhook
- `PORT` (optional): default 3000

Run locally:

```pwsh
docker build -t forward-to-ha .
docker run --rm -p 3000:3000 -e HA_URL=https://your.domain/api/webhook/<id> forward-to-ha
```

---

## 3) Create the Alexa skill and point it to /alexa

- Create a `Custom` skill in the Alexa Developer Console
- Under the Interaction model:
  - Under Intents, use the JSON Editor and paste this:
    <details>
      <summary>Click to expand</summary>
      
      ```json
      {
        "interactionModel": {
          "languageModel": {
            "invocationName": "home assistant",
            "intents": [
              {
                "name": "Trigger_HA",
                "slots": [
                  {
                    "name": "trigger",
                    "type": "AMAZON.SearchQuery"
                  }
                ],
                "samples": ["set {trigger}", "trigger {trigger}", "start {trigger}"]
              },
              {
                "name": "AMAZON.StopIntent",
                "samples": []
              }
            ],
            "types": []
          }
        }
      }
      ```
      
    </details>

- Under Endpoint:
  - HTTPS, Default Region -> https://wherever-you-hosted-this-docker-image/alexa
  - Use your public URL (Cloud Run/ingress/load balancer)
- Build the model and test

> [!TIP]
> For local testing only, use a tunnel (ngrok/cloudflared) to expose http://localhost:3000/alexa to the public internet over HTTPS.

---

## Exposed endpoints:

- `GET /` -> Welcome message
- `GET /version` -> The deployed version of the container
- `POST /alexa` -> Where Alexa should send requests, which are then forwarded to `HA_URL`
