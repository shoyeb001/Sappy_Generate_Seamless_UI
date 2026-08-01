import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import {
  clearAuthSession,
  getStoredAuthSession,
  saveAuthSession,
} from "~/features/auth/session"
import type { AuthSession, StoredAuthSession } from "~/features/auth/types"

type AuthState = {
  session: StoredAuthSession | null
}

const initialState: AuthState = {
  session: getStoredAuthSession(),
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authSessionReceived: (state, action: PayloadAction<AuthSession>) => {
      state.session = saveAuthSession(action.payload)
    },
    authSessionCleared: (state) => {
      state.session = null
      clearAuthSession()
    },
  },
})

export const { authSessionCleared, authSessionReceived } = authSlice.actions
export const authReducer = authSlice.reducer
