import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { authApi } from "~/features/auth/api"
import { authReducer } from "~/features/auth/slice"
import { generationApi } from "~/features/generation/api"
import { generationReducer } from "~/features/generation/slice"
import { settingsApi } from "~/features/settings/api"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    generation: generationReducer,
    [authApi.reducerPath]: authApi.reducer,
    [generationApi.reducerPath]: generationApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      generationApi.middleware,
      settingsApi.middleware
    ),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
