import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, labels } = await req.json();

    if (!text || !labels) {
      return NextResponse.json({ error: 'Text and labels are required' }, { status: 400 });
    }

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: text,
          parameters: { candidate_labels: labels },
        }),
      }
    );

    const result = await response.json();
    
    if (result.error) {
       return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
