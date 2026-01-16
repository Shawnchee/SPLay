import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export async function POST(req: NextRequest) {
    try {
        const { name, symbol, imageBase64, description } = await req.json();

        if (!imageBase64 || !name || !symbol) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const token = process.env.GITHUB_TOKEN;
        const owner = process.env.GITHUB_OWNER;
        const repo = process.env.GITHUB_REPO;

        if (!token || !owner || !repo) {
            return NextResponse.json({ error: "GitHub configuration missing in .env" }, { status: 500 });
        }

        const octokit = new Octokit({ auth: token });

        // 1. Upload Image
        const imagePath = `metadata/assets/${symbol.toLowerCase()}-${Date.now()}.png`;
        const imageContent = imageBase64.split(",")[1]; // Remove header

        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: imagePath,
            message: `Add icon for ${name}`,
            content: imageContent,
        });

        const imageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${imagePath}`;

        // 2. Upload Metadata JSON
        const metadata = {
            name,
            symbol,
            description: description || `Token for ${name}`,
            image: imageUrl,
            attributes: [],
            properties: {
                files: [
                    {
                        uri: imageUrl,
                        type: "image/png",
                    },
                ],
                category: "image",
            },
        };

        const jsonPath = `metadata/${symbol.toLowerCase()}-${Date.now()}.json`;
        const jsonContent = Buffer.from(JSON.stringify(metadata, null, 2)).toString("base64");

        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: jsonPath,
            message: `Add metadata for ${name}`,
            content: jsonContent,
        });

        const metadataUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${jsonPath}`;

        return NextResponse.json({ uri: metadataUrl });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message || "Failed to upload to GitHub" }, { status: 500 });
    }
}
