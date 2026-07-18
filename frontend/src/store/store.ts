import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux"

import { generationApi } from "./generation-api"
import { generationReducer } from "./generation-slice"

export const store = configureStore({
  reducer: {
    generation: generationReducer,
    [generationApi.reducerPath]: generationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(generationApi.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
