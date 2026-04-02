import { Innertube, UniversalCache, YTNodes } from "youtubei.js";

const youtube = await Innertube.create({ cache: new UniversalCache(true) });


const getVideoChapters = async(videoId)=>{
    try {
        console.log("Running")
        const info = await youtube.getInfo(videoId)
        console.log("Finished")
        return info.player_overlays.decorated_player_bar.player_bar.markers_map?.[0].value.chapters
    } catch (err) {
        console.log(err);
        throw err;
    }
}

const chap = await getVideoChapters("YSJY3DvnybE")

console.log(chap)