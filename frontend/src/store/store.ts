import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux"

import { authApi } from "./auth-api"
import { authReducer } from "./auth-slice"
import { generationApi } from "./generation-api"
import { generationReducer } from "./generation-slice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    generation: generationReducer,
    [authApi.reducerPath]: authApi.reducer,
    [generationApi.reducerPath]: generationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, generationApi.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
