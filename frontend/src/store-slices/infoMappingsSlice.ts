import type { VideoInfo } from "@/src/types/matesTypes"
import { createSlice } from "@reduxjs/toolkit"

const initialState: {[key: string]: VideoInfo} = {}

const infoMappingSlice = createSlice({
    name: "infoMappingsSice",
    initialState,
    reducers: {
        addInfo: (state, {payload}: {payload: {key: string, info: VideoInfo}})=>{
            state[payload.key] = payload.info
        },
        removeInfo: (state, {payload}: {payload: {key: string}})=>{
            delete(state?.[payload.key])
        }
    }
})

export const { addInfo, removeInfo } = infoMappingSlice.actions;
export default infoMappingSlice.reducer;