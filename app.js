require("dotenv").config();
const qrcode = require("qrcode-terminal");
const { Client } = require("whatsapp-web.js");
const { OpenAIApi, Configuration } = require("openai");
const client = new Client();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  // send welcome message
  const number = "88216756214";
  const sanitized_number = number.toString().replace(/[- )(]/g, "");
  const final_number = `62${sanitized_number.substring(
    sanitized_number.length - 11
  )}`;

  const number_details = await client.getNumberId(final_number);

  if (number_details) {
    await client.sendMessage(
      number_details._serialized,
      "Hello world, Client WhatsApp ChatGTP is Ready!!"
    );
  } else {
    console.log(final_number, "Mobile number is not registered");
  }

  client.on("message", async (message) => {
    if (message.body != "" || typeof message.body == "string") {
      const configuration = new Configuration({
        apiKey: process.env.API_KEY,
      });

      const openai = new OpenAIApi(configuration);
      const answer = await openai.createCompletion({
        model: "davinci",
        prompt: message.body,
        temperature: 0.5,
        max_tokens: 100,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      console.log(number_details._serialized);
      console.log(answer.data);
      await client.sendMessage(
        number_details._serialized,
        answer.data.choices[0].text
      );
    } else {
      message.reply(
        number_details._serialized,
        "Please Type Any Quetion, or Quetion not support for file extension type"
      );
    }
  });
  // check client is ready
  console.log("Client is ready!");
});

client.initialize();
