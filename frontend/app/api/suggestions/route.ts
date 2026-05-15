import { getSearchSuggestions } from "@/src/utils/youtubei"


export async function GET(req: Request){
    const {searchParams} = new URL(req.url)
    const query = searchParams.get("query")
    const suggestions = query ? await getSearchSuggestions(query) : []
    console.log(suggestions)
    return new Response(JSON.stringify(suggestions))
}