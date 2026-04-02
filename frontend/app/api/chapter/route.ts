
import { getVideoChapters } from "@/src/utils/youtubei"

export async function GET(req: Request) {
    const {searchParams} = new URL(req.url)
    const vidId = searchParams.get("id")

    const chapters = await getVideoChapters(vidId)

    return Response.json(chapters)
}