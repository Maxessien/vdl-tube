import { searchVideo } from "@/src/utils/youtubei"


const SearchPage = async({searchParams}: {searchParams: Promise<{query: string}>}) => {
    const {query} = await searchParams
    const searchResult = await searchVideo(query)
  return (
    <>
    
    </>
  )
}

export default SearchPage