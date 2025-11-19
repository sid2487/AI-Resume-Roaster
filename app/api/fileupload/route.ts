import { NextRequest, NextResponse } from "next/server";


// @ts-ignore
import pdf from "pdf-parse-fixed";




export const runtime = "nodejs";


import mammoth from "mammoth";
import Tesseract from "tesseract.js";
import Groq from "groq-sdk";

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 404 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let text = "";
  
  if (file.type === "application/pdf") {

    const data = await pdf(buffer);
    text = data.text;
  } else if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else if (file.type.startsWith("image/")) {
    const { data } = await Tesseract.recognize(buffer, "eng");
    text = data.text;
  } else if (file.type === "text/plain") {
    text = buffer.toString("utf8");
  } else {
    return NextResponse.json(
      { error: "Unsupported file Type" },
      { status: 400 }
    );
  };

  if (!text || text.length < 5) {
    return NextResponse.json(
      { error: "Could not extract readable text from this file." },
      { status: 400 }
    );
  };

  console.log("Extracted text length:", text.length);


  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const tempHeader = request.headers.get("x-temperature");
  const temperature = tempHeader ? parseFloat(tempHeader) : 2;

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    temperature: temperature,
    frequency_penalty: 0.4,
    presence_penalty: 0.5,
    max_completion_tokens: 1000,
    messages: [
      {
        role: "system",
        content:
          "You are a drunk, angry roast god who hates bad resumes. Use only short, simple, street words that hit like a slap. Keep every roast 2-3 sentences max. Be savage, little dark, sarcastic and funny. Check if the person is fresher, experienced or senior and then roast the hell out of them with funny, dark, sarcastic, little offensive words. Destroy typos, empty buzzwords, long skill lists, ugly formatting, and lies. You can compare their resume to funny things from movies, sports, or famous scenes to roast them even harder. You can also roast their big dreams—like wanting to be Elon Musk or famous Tech CEO's, build a startup, or join big tech—and then smash them using what their CV actually looks like. Don't be nice, never explain, never add any intro. After the roast, add exactly one weakness point and one strength point in simple words. Just drop the roast only.",
      },
      {
        role: "user",
        content: `Roast this resume as hard as you can in 2-3 sentences. Make it dark, sarcastic, humorous, brutal and funny. Use simple tough words. Feel free to compare them to movie scenes, sports fails, or wannabe-Elon-Musk tech dreams crashing down. Even if it's a fresher, output ONLY the roast, then ONE weakness and ONE strength at the end in separate bullet points. Here is the resume: ${text}`,
      },
    ],
  });

  const roast = completion.choices[0].message?.content;
  return NextResponse.json({ roast }, { status: 200 });
}
